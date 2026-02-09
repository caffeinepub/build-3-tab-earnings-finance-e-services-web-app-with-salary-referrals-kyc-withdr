import { useState } from 'react';
import { useMyDocuments, useUploadSensitiveDocument } from '../../hooks/queries/useDocuments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { encryptDocument } from '../../utils/crypto/clientEncryption';
import { ExternalBlob } from '../../backend';
import { CheckCircle2, XCircle, Upload, FileText, AlertCircle } from 'lucide-react';

export function KYCPage() {
  const { data: documents = [] } = useMyDocuments();
  const uploadDocument = useUploadSensitiveDocument();

  const [documentType, setDocumentType] = useState('nid');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const encryptedData = await encryptDocument(new Uint8Array(arrayBuffer));
      
      // Create a proper ArrayBuffer instance to avoid SharedArrayBuffer type issues
      const properBuffer = new ArrayBuffer(encryptedData.length);
      const properView = new Uint8Array(properBuffer);
      properView.set(encryptedData);
      
      const encryptedBlob = ExternalBlob.fromBytes(properView);

      await uploadDocument.mutateAsync({
        documentType,
        encryptedContent: encryptedBlob,
      });

      setFile(null);
      setDocumentType('nid');
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">KYC Verification</h2>
        <p className="text-muted-foreground">Upload your identity documents for verification</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          NID verification is required only for Banking & Finance services. All documents are encrypted before upload.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>Select document type and upload a clear photo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nid">National ID (NID)</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driving_license">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file">Document File</Label>
              <Input
                id="file"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                required
              />
              {file && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
              disabled={uploading || !file}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>Your submitted documents and their verification status</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map(([id, type, verified]) => (
                <div key={id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium capitalize">{type.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">ID: {id.slice(0, 20)}...</p>
                    </div>
                  </div>
                  {verified ? (
                    <Badge variant="default" className="bg-primary">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
