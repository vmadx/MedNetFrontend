import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home as HomeIcon, Upload, BarChart3, Bot, FileText, 
  User, LogOut, ChevronDown, Activity, Database, Target, 
  TrendingUp, Send, Eye, Github, Upload as UploadIcon,
  ChevronRight, Zap, X, Plus
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import ThemeToggle from '../components/ThemeToggle';
// Import useAuth to get API_URL for chat functionality
import { useAuth } from '../context/AuthContext'; 

const Home = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [ecgGraphData, setEcgGraphData] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your medical AI assistant specializing in ECG analysis and Atrial Fibrillation. I can help you understand your ECG results, answer questions about heart health, and provide information about AF. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const fileInputRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Get API_URL from context
  const { API_URL } = useAuth();

  // Function to render formatted chatbot messages with structure
  const renderFormattedMessage = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let currentSection = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Main heading (##)
      if (trimmed.startsWith('## ')) {
        if (currentSection.length > 0) {
          elements.push(<div key={`section-${index}`} className="mb-3">{currentSection}</div>);
          currentSection = [];
        }
        elements.push(
          <h2 key={`h2-${index}`} className="text-lg font-bold text-teal-600 dark:text-teal-400 mt-4 mb-2 first:mt-0">
            {trimmed.substring(3)}
          </h2>
        );
      }
      // Section heading (###)
      else if (trimmed.startsWith('### ')) {
        if (currentSection.length > 0) {
          elements.push(<div key={`section-${index}`} className="mb-2">{currentSection}</div>);
          currentSection = [];
        }
        elements.push(
          <h3 key={`h3-${index}`} className="text-md font-semibold text-slate-700 dark:text-slate-300 mt-3 mb-1.5">
            {trimmed.substring(4)}
          </h3>
        );
      }
      // Bullet point (• or -)
      else if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        const bulletText = trimmed.substring(2);
        elements.push(
          <div key={`bullet-${index}`} className="flex items-start gap-2 mb-1.5 ml-2">
            <span className="text-teal-600 dark:text-teal-400 mt-0.5">•</span>
            <span className="text-sm leading-relaxed flex-1">{bulletText}</span>
          </div>
        );
      }
      // Bold text detection (**text**)
      else if (trimmed.includes('**')) {
        const parts = trimmed.split('**');
        const formatted = parts.map((part, i) => 
          i % 2 === 1 ? <strong key={`bold-${index}-${i}`} className="font-semibold text-slate-900 dark:text-white">{part}</strong> : part
        );
        elements.push(
          <p key={`p-${index}`} className="text-sm leading-relaxed mb-2">
            {formatted}
          </p>
        );
      }
      // Horizontal line (---)
      else if (trimmed === '---') {
        elements.push(<hr key={`hr-${index}`} className="my-3 border-slate-300 dark:border-slate-600" />);
      }
      // Regular paragraph
      else if (trimmed.length > 0) {
        currentSection.push(
          <p key={`text-${index}`} className="text-sm leading-relaxed mb-2">
            {trimmed}
          </p>
        );
      }
      // Empty line - close current section
      else if (currentSection.length > 0) {
        elements.push(<div key={`section-${index}`} className="mb-2">{currentSection}</div>);
        currentSection = [];
      }
    });
    
    // Add any remaining section
    if (currentSection.length > 0) {
      elements.push(<div key="section-final">{currentSection}</div>);
    }
    
    return <div className="space-y-1">{elements}</div>;
  };

  // --- Sample Data Generation ---
  const [chartData] = useState(() => {
    const data = [];
    const anomalies = [45, 123, 267, 389, 445, 523, 678, 789, 856, 934, 1001, 1123];
    for (let i = 0; i < 1200; i++) {
      const baseValue = 50 + Math.sin(i * 0.1) * 20 + Math.random() * 10;
      const isAnomaly = anomalies.includes(i);
      const anomalyValue = isAnomaly ? baseValue + (Math.random() * 40 + 20) : baseValue;
      data.push({ time: i, value: anomalyValue, isAnomaly: isAnomaly ? 1 : 0 });
    }
    return data;
  });

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'history', label: 'Prediction History', icon: Database },
    { id: 'chatbot', label: 'Chatbot Assistant', icon: Bot },
    { id: 'documentation', label: 'Documentation', icon: FileText },
  ];

  // --- Handlers ---
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const csvFiles = files.filter(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
      if (csvFiles.length > 0) {
        setUploadedFiles(csvFiles);
        // For single file, also set uploadedFile for backward compatibility
        if (csvFiles.length === 1) {
          setUploadedFile(csvFiles[0]);
          await loadCsvPreview(csvFiles[0]);
        } else {
          // For multiple files, preview the first one
          setUploadedFile(csvFiles[0]);
          await loadCsvPreview(csvFiles[0]);
        }
      }
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  
  const handleDrop = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const csvFiles = files.filter(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    if (csvFiles.length > 0) {
      setUploadedFiles(csvFiles);
      if (csvFiles.length === 1) {
        setUploadedFile(csvFiles[0]);
        await loadCsvPreview(csvFiles[0]);
      } else {
        setUploadedFile(csvFiles[0]);
        await loadCsvPreview(csvFiles[0]);
      }
    }
  };

  // Remove a specific file from the uploaded files list
  const removeFile = (indexToRemove) => {
    const newFiles = uploadedFiles.filter((_, index) => index !== indexToRemove);
    setUploadedFiles(newFiles);
    
    if (newFiles.length === 0) {
      setUploadedFile(null);
      setCsvPreview(null);
      setEcgGraphData(null);
    } else if (indexToRemove === 0) {
      // If we removed the first file (the one being previewed), load preview of the new first file
      setUploadedFile(newFiles[0]);
      loadCsvPreview(newFiles[0]);
    }
  };

  // Add more files to the existing upload
  const addMoreFiles = () => {
    fileInputRef.current?.click();
  };

  // Load CSV preview and generate graph
  const loadCsvPreview = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/ecg/preview`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCsvPreview(data);
        
        // Prepare graph data
        const graphData = data.preview.slice(0, 1000).map((value, index) => ({
          time: index,
          value: value
        }));
        setEcgGraphData(graphData);
      } else {
        // Try to get error message from response
        let errorMessage = 'Failed to load CSV preview';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Response is not JSON, might be HTML error page
          const text = await response.text();
          console.error('Server response:', text);
        }
        console.error(errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error loading CSV preview:', error);
      alert('Error loading CSV preview. Please check if the backend server is running.');
    }
  };

  const runAnomalyDetection = async () => {
    if (!uploadedFile && uploadedFiles.length === 0) return;
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      
      // Check if we have multiple files
      if (uploadedFiles.length > 1) {
        // Use multiple file upload endpoint
        uploadedFiles.forEach(file => {
          formData.append('files', file);
        });

        const response = await fetch(`${API_URL}/api/ecg/predict-multiple`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          // Show results for all files
          setDetectionResults({
            multipleResults: result.results,
            count: result.count,
            datasetName: `${result.count} files`,
            status: result.status
          });
          setActiveSection('results');
          // Reload prediction history
          loadPredictionHistory();
        } else {
          let errorMessage = 'Failed to get predictions';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch (e) {
            const text = await response.text();
            console.error('Server response:', text);
            errorMessage = `Server error (${response.status}). Please check the console for details.`;
          }
          console.error('Prediction failed:', errorMessage);
          alert(errorMessage);
        }
      } else {
        // Single file upload
        formData.append('file', uploadedFile);

        const response = await fetch(`${API_URL}/api/ecg/predict`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          setDetectionResults({
            prediction: result.prediction,
            confidence: result.confidence,
            probabilityAf: result.probability_af,
            probabilityNormal: result.probability_normal,
            datasetName: uploadedFile.name,
            status: result.status
          });
          setActiveSection('results');
          // Reload prediction history
          loadPredictionHistory();
        } else {
          let errorMessage = 'Failed to get prediction';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch (e) {
            const text = await response.text();
            console.error('Server response:', text);
            errorMessage = `Server error (${response.status}). Please check the console for details.`;
          }
          console.error('Prediction failed:', errorMessage);
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error during prediction:', error);
      alert('Error during prediction. Please ensure the backend and model servers are running.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Chat Functionality ---
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsgText = chatInput; 
    
    // 1. Optimistic UI Update
    const newMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      text: userMsgText,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsChatTyping(true);
    
    // 2. Send message to Gemini-powered backend
    try {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsgText }),
        credentials: 'include' 
      });

      if (response.ok) {
        const data = await response.json();
        
        const botMessage = {
          id: chatMessages.length + 2,
          type: 'bot',
          text: data.response,
          timestamp: new Date(),
          hasContext: data.hasContext
        };
        
        setChatMessages(prev => [...prev, botMessage]);
      } else {
        // Handle error
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Sorry, I encountered an error. Please try again.';
        
        const botMessage = {
          id: chatMessages.length + 2,
          type: 'bot',
          text: errorMessage,
          timestamp: new Date(),
          isError: true
        };
        
        setChatMessages(prev => [...prev, botMessage]);
      }
    } catch (err) {
      console.error("Failed to get chat response:", err);
      
      const botMessage = {
        id: chatMessages.length + 2,
        type: 'bot',
        text: 'Sorry, I am unable to connect to the chat service. Please ensure the backend server is running and try again.',
        timestamp: new Date(),
        isError: true
      };
      
      setChatMessages(prev => [...prev, botMessage]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Load prediction history
  const loadPredictionHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`${API_URL}/api/ecg/history`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPredictionHistory(data);
      } else {
        console.error('Failed to load prediction history');
      }
    } catch (error) {
      console.error('Error loading prediction history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // View prediction from history (load CSV data and display graph)
  const viewPredictionFromHistory = (pred) => {
    if (pred.csvData) {
      try {
        // Parse the stored CSV data
        const parsedData = JSON.parse(pred.csvData);
        setEcgGraphData(parsedData);
        
        // Set detection results to show the prediction info
        setDetectionResults({
          prediction: pred.prediction,
          confidence: pred.confidence,
          probabilityAf: pred.probabilityAf,
          probabilityNormal: pred.probabilityNormal,
          datasetName: pred.filename,
          status: 'success'
        });
        
        // Switch to results view to show the graph and results
        setActiveSection('results');
      } catch (error) {
        console.error('Error parsing CSV data:', error);
        alert('Failed to load graph data. The data may be corrupted.');
      }
    } else {
      alert('No graph data available for this prediction. CSV data was not stored.');
    }
  };

  // Load chat history from backend
  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/history`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Convert backend format to frontend format
        const formattedMessages = data.map((msg, index) => ({
          id: index + 1,
          type: msg.type === 'user_message' ? 'user' : 'bot',
          text: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        
        // Add welcome message if no history
        if (formattedMessages.length === 0) {
          setChatMessages([{
            id: 1,
            type: 'bot',
            text: 'Hello! I\'m your medical AI assistant specializing in ECG analysis and Atrial Fibrillation. I can help you understand your ECG results, answer questions about heart health, and provide information about AF. How can I assist you today?',
            timestamp: new Date()
          }]);
        } else {
          setChatMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Load history on component mount
  useEffect(() => {
    loadPredictionHistory();
    loadChatHistory();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // --- Animations ---
  const sectionVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 150, damping: 15 } }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-8">
             <div className="text-center space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">Welcome to MED-Net</h1>
                  <p className="text-xl text-slate-700 dark:text-slate-400">Smart Anomaly Detection System</p>
                </motion.div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg max-w-4xl mx-auto border border-slate-200 dark:border-slate-700">
                  <p className="text-lg text-slate-700 dark:text-slate-300 mb-8">
                    MED-Net(Multi-Scale Enhanced Dual Temporal Convolution Attention Network)
                  </p>
                  <button onClick={() => setActiveSection('upload')} className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center mx-auto gap-2">
                    Get Started <ChevronRight className="w-5 h-5"/>
                  </button>
                </div>
             </div>
          </motion.div>
        );
      case 'upload':
        return (
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Upload ECG Data</h2>
              <p className="text-slate-600 dark:text-slate-400">Upload CSV files for ECG Atrial Fibrillation detection</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div 
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${uploadedFile ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-teal-400'}`}
                onDragOver={handleDragOver} onDrop={handleDrop}
              >
                <input ref={fileInputRef} type="file" accept=".csv" multiple onChange={handleFileUpload} className="hidden" />
                {uploadedFiles.length > 0 ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto">
                      <UploadIcon className="w-8 h-8 text-teal-600 dark:text-teal-400"/>
                    </div>
                    
                    {/* List of uploaded files with remove buttons */}
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm">
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="ml-3 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Remove file"
                          >
                            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add More Files button */}
                    <button
                      onClick={addMoreFiles}
                      className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add More Files
                    </button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer space-y-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                      <UploadIcon className="w-8 h-8 text-slate-400 dark:text-slate-500"/>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Drop CSV here</p>
                      <p className="text-sm text-slate-500">or click to browse (up to 10 files, 200MB each)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ECG Signal Preview */}
              {ecgGraphData && (
                <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">ECG Signal Preview</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ecgGraphData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                        <XAxis dataKey="time" stroke="#94a3b8" label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} />
                        <YAxis stroke="#94a3b8" label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                        <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                    Showing first {ecgGraphData.length} samples of ECG signal
                  </p>
                </div>
              )}

              <button 
                onClick={runAnomalyDetection} 
                disabled={uploadedFiles.length === 0 || isProcessing} 
                className="w-full mt-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold disabled:bg-slate-300 dark:disabled:bg-slate-700 flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Analyzing ECG...' : `Analyze ${uploadedFiles.length > 1 ? `${uploadedFiles.length} Files` : 'ECG'} for AF`} <Zap className="w-5 h-5"/>
              </button>
            </div>
          </motion.div>
        );
      case 'results':
        return (
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-8">
             <div className="text-center mb-8"><h2 className="text-3xl font-bold text-slate-900 dark:text-white">ECG Analysis Results</h2></div>
             {detectionResults ? (
               <div className="space-y-8">
                 {/* Multiple Files Results */}
                 {detectionResults.multipleResults ? (
                   <div className="space-y-6">
                     <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
                       <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                         Analysis Complete: {detectionResults.count} Files
                       </h3>
                       <p className="text-sm text-slate-600 dark:text-slate-400">
                         Results for each file are shown below
                       </p>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {detectionResults.multipleResults.map((result, index) => (
                         <div key={index} className={`rounded-xl p-6 shadow-lg border-2 ${
                           result.prediction === 'Atrial Fibrillation Detected' 
                             ? 'bg-red-50 dark:bg-red-900/20 border-red-400' 
                             : 'bg-green-50 dark:bg-green-900/20 border-green-400'
                         }`}>
                           <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-3 truncate" title={result.filename}>
                             {result.filename}
                           </h4>
                           <div className={`text-2xl font-bold mb-2 ${
                             result.prediction === 'Atrial Fibrillation Detected'
                               ? 'text-red-700 dark:text-red-400'
                               : 'text-green-700 dark:text-green-400'
                           }`}>
                             {result.prediction === 'Atrial Fibrillation Detected' ? '⚠️' : '✅'} {result.prediction}
                           </div>
                           <div className="space-y-2 text-sm">
                             <p className="text-slate-700 dark:text-slate-300">
                               <span className="font-medium">Confidence:</span> {((result.confidence || 0) * 100).toFixed(1)}%
                             </p>
                             <p className="text-slate-700 dark:text-slate-300">
                               <span className="font-medium">AF Probability:</span> {((result.probability_af || 0) * 100).toFixed(1)}%
                             </p>
                             <p className="text-slate-700 dark:text-slate-300">
                               <span className="font-medium">Normal Probability:</span> {((result.probability_normal || 0) * 100).toFixed(1)}%
                             </p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ) : (
                   <>
                     {/* Single File Prediction Result Card */}
                     <div className={`rounded-2xl p-8 shadow-lg border-4 text-center ${
                       detectionResults.prediction === 'Atrial Fibrillation Detected' 
                         ? 'bg-red-50 dark:bg-red-900/20 border-red-400' 
                         : 'bg-green-50 dark:bg-green-900/20 border-green-400'
                     }`}>
                   <h3 className={`text-3xl font-bold mb-4 ${
                     detectionResults.prediction === 'Atrial Fibrillation Detected'
                       ? 'text-red-700 dark:text-red-400'
                       : 'text-green-700 dark:text-green-400'
                   }`}>
                     {detectionResults.prediction === 'Atrial Fibrillation Detected' ? '⚠️' : '✅'} {detectionResults.prediction}
                   </h3>
                   <p className="text-xl text-slate-700 dark:text-slate-300">
                     Confidence: <span className="font-bold">{(detectionResults.confidence * 100).toFixed(1)}%</span>
                   </p>
                   <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                     File: {detectionResults.datasetName}
                   </p>
                 </div>

                 {/* ECG Graph */}
                 {ecgGraphData && (
                   <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                     <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">ECG Signal</h3>
                     <div className="h-96">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={ecgGraphData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                           <XAxis dataKey="time" stroke="#94a3b8" label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} />
                           <YAxis stroke="#94a3b8" label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }} />
                           <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                           <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={1.5} dot={false} />
                         </LineChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 )}

                 {/* Probability Breakdown */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                         <Activity className="w-6 h-6 text-green-600 dark:text-green-400"/>
                       </div>
                       <div>
                         <div className="text-2xl font-bold text-slate-900 dark:text-white">
                           {(detectionResults.probabilityNormal * 100).toFixed(1)}%
                         </div>
                         <div className="text-sm text-slate-500">Normal ECG</div>
                       </div>
                     </div>
                     <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                       <div 
                         className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                         style={{ width: `${detectionResults.probabilityNormal * 100}%` }}
                       ></div>
                     </div>
                   </div>
                   
                   <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                         <Target className="w-6 h-6 text-red-600 dark:text-red-400"/>
                       </div>
                       <div>
                         <div className="text-2xl font-bold text-slate-900 dark:text-white">
                           {(detectionResults.probabilityAf * 100).toFixed(1)}%
                         </div>
                         <div className="text-sm text-slate-500">Atrial Fibrillation</div>
                       </div>
                     </div>
                     <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                       <div 
                         className="bg-red-500 h-3 rounded-full transition-all duration-500" 
                         style={{ width: `${detectionResults.probabilityAf * 100}%` }}
                       ></div>
                     </div>
                   </div>
                 </div>

                 {/* Clinical Interpretation */}
                 <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                   <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                     <Database className="w-5 h-5 text-teal-600" /> Clinical Interpretation
                   </h3>
                   {detectionResults.prediction === 'Atrial Fibrillation Detected' ? (
                     <div className="text-slate-700 dark:text-slate-300 space-y-2">
                       <p className="font-medium text-red-700 dark:text-red-400">⚠️ Atrial Fibrillation (AF) has been detected in this ECG signal.</p>
                       <p className="text-sm">AF is characterized by:</p>
                       <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                         <li>Irregular heart rhythm</li>
                         <li>Absence of P-waves</li>
                         <li>Irregularly irregular RR intervals</li>
                       </ul>
                       <p className="text-sm mt-3 font-medium">⚠️ Note: This is a screening tool. Please consult a healthcare professional for proper diagnosis and treatment.</p>
                     </div>
                   ) : (
                     <div className="text-slate-700 dark:text-slate-300 space-y-2">
                       <p className="font-medium text-green-700 dark:text-green-400">✅ Normal sinus rhythm detected.</p>
                       <p className="text-sm">The ECG signal shows:</p>
                       <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                         <li>Regular heart rhythm</li>
                         <li>Normal P-waves</li>
                         <li>Regular RR intervals</li>
                       </ul>
                       <p className="text-sm mt-3">✅ No signs of Atrial Fibrillation detected.</p>
                     </div>
                   )}
                 </div>
                    </>
                  )}
               </div>
             ) : (
               <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                 <Eye className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                 <p>No results yet. Please upload ECG data and run analysis.</p>
               </div>
             )}
          </motion.div>
        );
      case 'chatbot':
        return (
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="h-full flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
                <Bot className="w-8 h-8 text-teal-600"/> MED-Net Assistant
              </h2>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col h-[600px]">
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {chatMessages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl ${msg.type === 'bot' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white' : 'bg-teal-600 text-white'}`}>
                        {msg.type === 'bot' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {renderFormattedMessage(msg.text)}
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        )}
                        <p className="text-xs mt-2 opacity-70">{msg.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isChatTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                <input 
                  type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} 
                  onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask about your results..." 
                  className="flex-1 px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <button 
                  onClick={sendChatMessage} 
                  disabled={!chatInput.trim()} 
                  className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5"/>
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 'history':
        return (
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Prediction History</h2>
              <p className="text-slate-600 dark:text-slate-400">View your past ECG analysis results</p>
            </div>
            
            {isLoadingHistory ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Loading history...</p>
              </div>
            ) : predictionHistory.length === 0 ? (
              <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                <Database className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                <p>No predictions yet. Upload an ECG file to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {predictionHistory.map((pred, index) => (
                  <div 
                    key={pred.id || index} 
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow cursor-pointer group"
                    onClick={() => viewPredictionFromHistory(pred)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${pred.prediction === 'Atrial Fibrillation Detected' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {pred.filename}
                          </h3>
                          {pred.csvData && (
                            <span className="ml-auto px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-semibold rounded-full flex items-center gap-1">
                              <Eye className="w-3 h-3"/> View Graph
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Result</p>
                            <p className={`font-semibold ${pred.prediction === 'Atrial Fibrillation Detected' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                              {pred.prediction}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Confidence</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {(pred.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">AF Probability</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {(pred.probabilityAf * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {new Date(pred.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {pred.csvData && (
                          <div className="mt-3 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4"/>
                            Click to view ECG signal graph and detailed results
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-center mt-8">
              <button 
                onClick={loadPredictionHistory}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold flex items-center gap-2"
              >
                <Activity className="w-5 h-5"/> Refresh History
              </button>
            </div>
          </motion.div>
        );
      case 'documentation':
        return (
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-8">
             <div className="text-center mb-8"><h2 className="text-3xl font-bold text-slate-900 dark:text-white">Documentation</h2></div>
             <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                 <FileText className="w-12 h-12 mx-auto text-teal-600 mb-4"/>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Full Guide</h3>
                 <p className="text-slate-600 dark:text-slate-400 mb-6">Access the complete technical manual.</p>
                 <button className="text-teal-600 font-semibold hover:underline">Open Documentation</button>
               </div>
               <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                 <Github className="w-12 h-12 mx-auto text-slate-700 dark:text-slate-300 mb-4"/>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Source Code</h3>
                 <p className="text-slate-600 dark:text-slate-400 mb-6">Contribute to MED-Net on GitHub.</p>
                 <a href="https://github.com/EhsaasN/DUAL_TCN_ATTN" target="_blank" rel="noreferrer" className="text-teal-600 font-semibold hover:underline">View Repository</a>
               </div>
             </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-0 w-full z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 h-16 flex items-center px-4 sm:px-8 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">M</div>
          <span className="font-bold text-xl text-slate-900 dark:text-white">MED-Net</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle/>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 pl-4">
            <User size={16}/>
            <span className="font-medium text-sm">{user?.name || 'User'}</span>
          </div>
        </div>
      </motion.nav>

      <div className="flex pt-16">
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg flex flex-col z-40">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">Navigation</h2>
          </div>
          <nav className="p-4 space-y-2 flex-1">
            {sidebarItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveSection(item.id)} 
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  activeSection === item.id 
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800' 
                    : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <item.icon size={20} className={activeSection === item.id ? "text-teal-600 dark:text-teal-400" : ""}/>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {activeSection === item.id && <ChevronDown size={16} className="text-teal-600 dark:text-teal-400"/>}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              onClick={onLogout} 
              className="w-full py-3 px-4 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors font-medium"
            >
              <LogOut size={20}/> 
              <span>Logout</span>
            </button>
          </div>
        </aside>
        
        <main className="flex-1 ml-72 p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
          <AnimatePresence mode="wait">
            {renderSection()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Home;