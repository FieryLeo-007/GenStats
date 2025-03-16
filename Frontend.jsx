import { useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function GenStats() {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post("http://localhost:8000/upload", formData);
    setFileId(response.data.file_id);
  };

  const fetchSummary = async () => {
    if (!fileId) return;
    const response = await axios.get(`http://localhost:8000/summary/${fileId}`);
    setSummary(response.data);
  };

  const askAI = async () => {
    if (!query) return;
    const response = await axios.post("http://localhost:8000/generate_insights", { query });
    setAiResponse(response.data.response);
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4 space-y-4">
          <Label>Upload CSV Dataset</Label>
          <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <Button onClick={handleFileUpload}>Upload</Button>
          {fileId && <p className="text-green-500">File uploaded successfully!</p>}
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl">
        <CardContent className="p-4 space-y-4">
          <Button onClick={fetchSummary} disabled={!fileId}>
            Generate Data Summary
          </Button>
          {summary && (
            <div className="p-2 bg-gray-100 rounded-lg">
              <pre className="text-sm">{JSON.stringify(summary, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl">
        <CardContent className="p-4 space-y-4">
          <Label>Ask GenStats AI</Label>
          <Textarea
            placeholder="Describe your analysis needs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={askAI}>Generate Insights</Button>
          {aiResponse && (
            <div className="p-2 bg-gray-100 rounded-lg">
              <p className="text-sm">{aiResponse}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}