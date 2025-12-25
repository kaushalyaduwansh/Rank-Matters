'use client'

import { useState, useEffect, useRef } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { 
  Upload, Loader2, Trash2, Link as LinkIcon, 
  ExternalLink, LayoutDashboard, ListFilter, FileText, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

// Import your server actions
import { addExam, getExams, deleteExam } from '../../server/actions'; 

export default function ExamDashboard() {
  const { user } = useUser();
  const [view, setView] = useState<'add' | 'list'>('add');
  const [isLoading, setIsLoading] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  
  // File state for validation
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch exams on view switch
  useEffect(() => {
    if (view === 'list') fetchExams();
  }, [view]);

  async function fetchExams() {
    setIsLoading(true);
    const data = await getExams();
    setExams(data);
    setIsLoading(false);
  }

  // --- FILE VALIDATION HANDLER ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1MB = 1048576 bytes
    if (file.size > 1048576) {
        toast.error('File size must be less than 1MB', {
            icon: <AlertCircle className="text-red-500" />,
            style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        e.target.value = ''; // Reset input
        setSelectedFile(null);
        return;
    }

    setSelectedFile(file);
    toast.success('Image attached successfully');
  };

  async function handleDelete(id: number) {
    if(confirm('Are you sure you want to delete this exam?')) {
        const loadingToast = toast.loading('Deleting exam...');
        const result = await deleteExam(id);
        toast.dismiss(loadingToast);

        if (result.success) {
            toast.success('Exam deleted');
            fetchExams();
        } else {
            toast.error('Failed to delete');
        }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
        toast.error('Please upload a banner image');
        return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Uploading and publishing...');

    const formData = new FormData(event.currentTarget);
    const result = await addExam(formData);
    
    toast.dismiss(loadingToast);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message, { icon: '🚀' });
      (event.target as HTMLFormElement).reset();
      setSelectedFile(null);
    } else {
      toast.error(result.message); // Handles Unique URL error
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 text-slate-900 font-sans selection:bg-blue-100">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">Rank Matters</h1>
                    <p className="text-xs text-slate-500 font-medium">Admin Dashboard</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-sm font-medium text-slate-700">{user?.fullName || 'Administrator'}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Super Admin</span>
                </div>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9 border border-gray-200" } }}/>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        
        {/* --- TAB SWITCHER (PILL STYLE) --- */}
        <div className="flex justify-between items-center mb-8">
            <div className="inline-flex items-center bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                <button
                    onClick={() => setView('add')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        view === 'add' 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-gray-50'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    Create Exam
                </button>
                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                <button
                    onClick={() => setView('list')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        view === 'list' 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-gray-50'
                    }`}
                >
                    <ListFilter className="w-4 h-4" />
                    All Exams
                    <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md text-[10px] border border-gray-200">
                        {exams.length > 0 ? exams.length : '0'}
                    </span>
                </button>
            </div>
        </div>

        {/* --- VIEW: ADD EXAM (FULL WIDTH) --- */}
        {view === 'add' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-4">
                    <h2 className="text-lg font-semibold text-slate-800">Exam Details</h2>
                    <p className="text-sm text-slate-500">Enter the recruitment information below. Fields marked * are required.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        
                        {/* LEFT COLUMN: Main Info */}
                        <div className="md:col-span-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold">Exam Name</Label>
                                    <Input name="name" placeholder="e.g. SSC CGL 2025 Notification" required className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold">Category</Label>
                                    <Select name="type" defaultValue="Others">
                                        <SelectTrigger className=" h-9 bg-gray-50 border-gray-200 focus:bg-white">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SSC">SSC (Staff Selection)</SelectItem>
                                            <SelectItem value="Others">Others</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold">Target URL (Slug)</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-mono text-sm">rankmatters.in/</span>
                                    </div>
                                    <Input name="url" placeholder="ssc-cgl-notification-2025" required className="h-11 pl-35 bg-gray-50 border-gray-200 font-mono text-sm focus:bg-white transition-all" />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <LinkIcon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400">This URL must be unique. If it exists, the system will reject it.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold">Description / Syllabus Note</Label>
                                <Textarea name="description" placeholder="Enter a brief summary or syllabus overview..." rows={6} className="bg-gray-50 border-gray-200 resize-none focus:bg-white transition-all p-4" />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Upload & Actions */}
                        <div className="md:col-span-4 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold">Banner Image</Label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative group border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'}`}
                                >
                                    <input 
                                        ref={fileInputRef}
                                        name="image" 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                    />
                                    
                                    {selectedFile ? (
                                        <>
                                            <div className="bg-green-100 p-3 rounded-full mb-3">
                                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                            </div>
                                            <p className="text-sm font-medium text-green-800 truncate w-full px-4">{selectedFile.name}</p>
                                            <p className="text-xs text-green-600 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                            <p className="text-xs text-gray-400 mt-4 underline">Click to change</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                <Upload className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-700">Upload Banner</p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 1MB</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="animate-spin w-4 h-4" /> Processing...
                                        </span>
                                    ) : (
                                        'Publish Exam Notification'
                                    )}
                                </Button>
                                <p className="text-center text-[10px] text-gray-400 mt-3">
                                    By publishing, this will be live on the app instantly.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
          </div>
        )}

        {/* --- VIEW: LIST EXAMS (Tabular/Grid) --- */}
        {view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {isLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
                    <p className="text-slate-500 text-sm">Loading records...</p>
                </div>
             ) : exams.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ListFilter className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-slate-900 font-medium">No exams found</h3>
                    <p className="text-slate-500 text-sm mt-1">Create a new exam to see it listed here.</p>
                </div>
             ) : (
               exams.map((exam) => (
                 <Card key={exam.id} className="group overflow-hidden border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-white">
                   {/* Card Image Header */}
                   <div className="h-32 bg-gray-100 relative overflow-hidden">
                       <img src={exam.imageUrl} alt={exam.examName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                       <div className="absolute top-3 left-3">
                           <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-200 shadow-sm uppercase tracking-wide">
                             {exam.type}
                           </span>
                       </div>
                   </div>
                   
                   <div className="p-5">
                       <div className="mb-3">
                           <h3 className="font-bold text-slate-900 truncate" title={exam.examName}>{exam.examName}</h3>
                           <div className="flex items-center gap-1 text-xs text-blue-600 font-mono mt-1">
                              <LinkIcon className="w-3 h-3" />
                              <span className="truncate">/{exam.url}</span>
                           </div>
                       </div>
                       
                       <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mb-4">
                           {exam.description || 'No description provided.'}
                       </p>

                       <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                           <span className="text-[10px] text-gray-400">Created recently</span>
                           <Button 
                             variant="ghost" 
                             size="sm"
                             className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                             onClick={() => handleDelete(exam.id)}
                           >
                             <Trash2 className="w-4 h-4 mr-1.5" />
                             Delete
                           </Button>
                       </div>
                   </div>
                 </Card>
               ))
             )}
          </div>
        )}

      </main>
    </div>
  );
}