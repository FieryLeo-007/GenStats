import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUploader } from "react-drag-drop-files";
import { WebSocketProvider, useWebSocket } from "react-use-websocket";
import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [wsMessage, setWsMessage] = useState("");
  const { sendMessage, lastMessage } = useWebSocket("ws://localhost:8000/ws");
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const { toast } = useToast();

  const handleFileChange = (file) => {
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please upload a CSV file." });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    setData(result);
    toast({ title: "Upload successful", description: "Dataset processed successfully!" });
  };

  const handleSendMessage = () => {
    sendMessage(wsMessage);
  };

  const handleAIChat = async (query) => {
    setShowAIChat(true);
    const response = await fetch("http://localhost:8000/generate_ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const result = await response.json();
    setAiResponse(result.response);
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Upload Dataset</h2>
          <FileUploader handleChange={handleFileChange} name="file" types={["CSV"]} />
          <Button onClick={handleUpload} className="mt-4">Process File</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Real-time Collaboration</h2>
          <Input value={wsMessage} onChange={(e) => setWsMessage(e.target.value)} placeholder="Send a message" />
          <Button onClick={handleSendMessage} className="mt-2">Send</Button>
          <p className="mt-2">Last Message: {lastMessage?.data}</p>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Visualization</h2>
          {data && (
            <>
              <BarChart width={600} height={300} data={data}>
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Outlier" fill="#8884d8" />
              </BarChart>
              <LineChart width={600} height={300} data={data}>
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Predicted" stroke="#82ca9d" />
              </LineChart>
            </>
          )}
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Generative AI Assistant</h2>
          <Input placeholder="Ask me anything about your dataset..." onKeyDown={(e) => e.key === 'Enter' && handleAIChat(e.target.value)} />
          <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Response</DialogTitle>
              </DialogHeader>
              <p>{aiResponse}</p>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
