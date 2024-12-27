import { useState, useRef, useEffect } from 'react'
import { marked } from 'marked'
import './App.css'

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
  pedantic: false,
  mangle: false,
  headerIds: false
})

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 무엇을 도와드릴까요?' }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: newMessage }])
    setNewMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'phi3.5',
          prompt: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('API 요청에 실패했습니다')
      }

      // Add an empty assistant message that we'll update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let currentContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the stream chunk and parse the JSON
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.trim()) {
            const data = JSON.parse(line)
            currentContent += data.response

            // Update the last message with accumulated content
            setMessages(prev => {
              const newMessages = [...prev]
              newMessages[newMessages.length - 1].content = currentContent
              return newMessages
            })
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '죄송합니다. 응답을 받아오는 중에 오류가 발생했습니다.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.role === 'assistant'
                    ? 'bg-white text-gray-800'
                    : 'bg-blue-500 text-white'
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked(message.content.replace(/~/g, '\\~'))
                  }}
                />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 shadow-sm rounded-lg p-3">
                응답을 생성하는 중...
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 bg-white border-t">
          <div className="flex space-x-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              type="text"
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              className={`px-6 py-2 bg-blue-500 text-white rounded-lg transition-colors ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-600'
              }`}
              disabled={isLoading}
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
