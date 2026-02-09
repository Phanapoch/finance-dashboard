import React, { useState, useEffect } from 'react'
import { X, Sparkles, AlertTriangle, Copy, Trash2, CheckCircle, BrainCircuit } from 'lucide-react'

export function AIInsightsModal({ onClose, filters, userEmail }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('qwen3-coder:30b')
  const [availableModels, setAvailableModels] = useState([])

  useEffect(() => {
    setAvailableModels([
      'qwen3-coder:30b',
      'llama3.1:8b',
      'gemma3:12b',
      'deepseek-r1:14b',
      'glm-4.7-flash:latest'
    ])
  }, [])

  const handleAnalyze = () => {
    setLoading(true)
    setError(null)
    setData(null)
    
    const queryParams = new URLSearchParams()
    if (filters.from) queryParams.append('date_from', filters.from)
    if (filters.to) queryParams.append('date_to', filters.to)
    if (userEmail) queryParams.append('email', userEmail)
    if (selectedModel) queryParams.append('model', selectedModel)
    if (customPrompt) queryParams.append('prompt', customPrompt)

    fetch(`/api/ai/analyze?${queryParams.toString()}`, {
        method: 'POST'
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json.data)
        } else {
          setError(json.error || 'Failed to get AI analysis')
        }
      })
      .catch(err => {
        console.error('Error fetching AI analysis:', err)
        setError('Network error. Please try again.')
      })
      .finally(() => setLoading(false))
  }

  if (!onClose) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Financial Insights</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!data && !loading && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <p className="text-sm text-indigo-800 dark:text-indigo-300 mb-4">
                  เลือกโมเดลและระบุสิ่งที่ต้องการให้อาเรียวิเคราะห์ได้เลยค่ะ 🧚‍♀️
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Select Model</label>
                    <select 
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {availableModels.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Custom Prompt (Optional)</label>
                    <textarea 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="เช่น สรุปรายจ่ายของเดือนนี้ให้หน่อย หรือ มีรายการไหนที่ซ้ำกันบ้าง?"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                    />
                  </div>

                  <button 
                    onClick={handleAnalyze}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Start AI Analysis
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading AI Analysis...</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-start gap-3 border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Analysis Error</p>
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => {setData(null); setError(null);}}
                className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-200 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : data ? (
            <>
              <button 
                onClick={() => setData(null)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline mb-2 flex items-center gap-1"
              >
                ← Change Model or Prompt
              </button>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" /> สรุปภาพรวม
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-gray-700 dark:text-gray-200 text-sm leading-relaxed border border-gray-100 dark:border-gray-700">
                  {data.summary}
                </div>
              </section>

              <section className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">คำแนะนำทางการเงิน</h4>
                    <p className="text-sm text-indigo-800 dark:text-indigo-400 mt-1">{data.advice}</p>
                  </div>
                </div>
              </section>

              {data.anomalies && data.anomalies.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> รายการที่น่าสงสัย
                  </h3>
                  <div className="space-y-2">
                    {data.anomalies.map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.desc || item.description}</p>
                          <p className="text-xs text-gray-500">{item.date} • {item.cat || item.category}</p>
                        </div>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">฿{(item.amount || 0).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {data.duplicates && data.duplicates.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider flex items-center gap-2">
                    <Copy className="w-4 h-4" /> รายการที่อาจซ้ำกัน
                  </h3>
                  <div className="space-y-3">
                    {data.duplicates.map((group, groupIdx) => (
                      <div key={groupIdx} className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30 space-y-2">
                         <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-orange-800 dark:text-orange-300">กลุ่มที่ #{groupIdx + 1}</span>
                           <button className="text-xs flex items-center gap-1 text-red-600 hover:text-red-700 font-bold">
                             <Trash2 className="w-3 h-3" /> ลบรายการซ้ำ
                           </button>
                         </div>
                         <div className="space-y-2">
                           {Array.isArray(group) && group.map((item, itemIdx) => (
                             <div key={itemIdx} className="bg-white dark:bg-gray-800 p-2 rounded border border-orange-100 dark:border-orange-900/20 flex justify-between items-center">
                               <div>
                                 <p className="text-xs font-semibold text-gray-900 dark:text-white">{item.desc || item.description || "ไม่ระบุชื่อรายการ"}</p>
                                 <p className="text-[10px] text-gray-500">{item.date || "ไม่ระบุวันที่"}</p>
                               </div>
                               <p className="text-xs font-bold text-gray-900 dark:text-white">฿{(item.amount || 0).toLocaleString()}</p>
                             </div>
                           ))}
                         </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : null}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
