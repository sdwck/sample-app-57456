import { useState } from 'react';

const API_URL = 'http://localhost:8080/api';

export default function MailPage() {
  const [inbox, setInbox] = useState<string[]>([]);
  const [pop3Msg, setPop3Msg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMail, setSelectedMail] = useState<string | null>(null);

  const checkImap = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/mail/inbox`);
      const data = await res.json(); 
      setInbox(data.messages || []);
    } finally { setLoading(false); }
  };

  const checkPop3 = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/mail/pop3-check`);
      const data = await res.json();
      setPop3Msg(getPreview(data.lastMessage) || "Empty");
    } finally { setLoading(false); }
  };

  const getPreview = (html: string) => {
    return html.replace(/<[^>]*>?/gm, ' ');
  };

  return (
    <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
      <div className="bg-gray-800 p-4 rounded border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-200">IMAP</h3>
          <button onClick={checkImap} disabled={loading} className="bg-green-700 px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50 text-white">
            Check
          </button>
        </div>
        <div className="h-64 overflow-y-auto bg-gray-900 p-2 rounded border border-gray-700">
          {inbox.map((m, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedMail(m)}
              className="border-b border-gray-800 py-3 cursor-pointer hover:bg-gray-800 text-sm text-gray-300 transition hover:text-white"
            >
              <div className="truncate">{getPreview(m)}</div>
            </div>
          ))}
          {!inbox.length && <div className="text-gray-600 text-center mt-10">No emails loaded</div>}
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-200">POP3</h3>
          <button onClick={checkPop3} disabled={loading} className="bg-orange-700 px-3 py-1 rounded text-sm hover:bg-orange-600 disabled:opacity-50 text-white">
            Check
          </button>
        </div>
        <pre className="h-64 overflow-y-auto bg-gray-900 p-2 rounded border border-gray-700 text-xs text-gray-400 whitespace-pre-wrap">
          {pop3Msg || "Click check to get last message body..."}
        </pre>
      </div>
      {selectedMail && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            
            <div className="p-4 bg-gray-900 flex justify-between items-center border-b border-gray-800">
              <h3 className="font-bold text-white">Message View</h3>
              <button onClick={() => setSelectedMail(null)} className="text-gray-400 hover:text-white text-2xl leading-none">
                &times;
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-white text-gray-900">
               <div 
                 className="[&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-2 [&>p]:mb-2 font-sans"
                 dangerouslySetInnerHTML={{ __html: selectedMail }} 
               />
            </div>
            <div className="p-4 bg-gray-100 border-t border-gray-200 text-right">
              <button onClick={() => setSelectedMail(null)} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}