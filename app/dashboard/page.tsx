'use client'

import { useState, useEffect, useRef } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { 
  Upload, Loader2, Trash2, Link as LinkIcon, 
  LayoutDashboard, ListFilter, FileText, 
  CheckCircle2, AlertCircle, Copy, Hash, RefreshCcw,
  Check, X, HelpCircle
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

// --- CONFIGURATION: Default Marks ---
const EXAM_DEFAULTS = {
    SSC: { right: '2', wrong: '0.5', label: 'SSC' },
    RRB: { right: '1', wrong: '0.333333', label: 'Railway' }, // High precision for 1/3
    BANK: { right: '1', wrong: '0.25', label: 'Banking' },
    OTHERS: { right: '1', wrong: '0.25', label: 'Others' }
};

export default function ExamDashboard() {
  const { user } = useUser();
  const [view, setView] = useState<'add' | 'list'>('add');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  
  // Form State
  const [examName, setExamName] = useState('');
  const [category, setCategory] = useState('SSC'); // Default to SSC
  const [slug, setSlug] = useState('');
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  
  // Marks State (Defaulted to SSC initially)
  const [totalQues, setTotalQues] = useState('100');
  const [rightMark, setRightMark] = useState(EXAM_DEFAULTS.SSC.right);
  const [wrongMark, setWrongMark] = useState(EXAM_DEFAULTS.SSC.wrong);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Fetch
  useEffect(() => {
    if (view === 'list') fetchExams();
  }, [view]);

  // --- DATA FETCHING ---
  async function fetchExams() {
    try {
      setIsFetching(true);
      const data = await getExams();
      if (Array.isArray(data)) {
        setExams(data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load answer keys.');
    } finally {
      setIsFetching(false);
    }
  }

  // --- AUTO FILL LOGIC ---
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    
    // Auto-fill marks based on selection
    // @ts-ignore
    const defaults = EXAM_DEFAULTS[value];
    if (defaults) {
        setRightMark(defaults.right);
        setWrongMark(defaults.wrong);
        toast.success(`Marks updated for ${defaults.label}`, {
            icon: '⚡',
            position: 'bottom-center',
            style: { fontSize: '12px' }
        });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setExamName(name);
    if (!isSlugEdited) {
      const generatedSlug = name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugEdited(true);
  };

  // --- FILE VALIDATION ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1048576) { // 1MB
        toast.error('File size must be less than 1MB');
        e.target.value = '';
        setSelectedFile(null);
        return;
    }
    setSelectedFile(file);
    toast.success('Icon attached successfully');
  };

  const copyToClipboard = (urlSlug: string) => {
    const fullUrl = `https://rankmatters.in/${urlSlug}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('URL copied to clipboard!');
  };

  async function handleDelete(id: number) {
    if(confirm('Are you sure you want to delete this Answer Key permanently?')) {
        const loadingToast = toast.loading('Deleting...');
        try {
            const result = await deleteExam(id);
            toast.dismiss(loadingToast);

            if (result.success) {
                toast.success('Deleted successfully');
                fetchExams(); 
            } else {
                toast.error(result.message || 'Failed to delete');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('An error occurred while deleting');
        }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
        toast.error('Please upload an icon image');
        return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Publishing Answer Key...');

    try {
        const formData = new FormData(event.currentTarget);
        // Force the controlled values into formData to ensure precision is kept
        formData.set('right_mark', rightMark);
        formData.set('wrong_mark', wrongMark);

        const result = await addExam(formData);
        
        toast.dismiss(loadingToast);
        
        if (result.success) {
          toast.success(result.message, { icon: '🚀' });
          // Reset form
          setExamName('');
          setSlug('');
          setTotalQues('100');
          // Reset marks to current category default
          // @ts-ignore
          setRightMark(EXAM_DEFAULTS[category].right);
          // @ts-ignore
          setWrongMark(EXAM_DEFAULTS[category].wrong);
          
          setIsSlugEdited(false);
          setSelectedFile(null);
          (event.target as HTMLFormElement).reset();
        } else {
          toast.error(result.message);
        }
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('Something went wrong. Please try again.');
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 text-slate-900 font-sans selection:bg-blue-100">
      
      {/* --- TOP HEADER --- */}
      <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-slate-900 p-2 rounded-lg">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">Rank Matters</h1>
                    <p className="text-xs text-slate-500 font-medium">Answer Key Dashboard</p>
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
        
        {/* --- TABS --- */}
        <div className="flex justify-between items-center mb-8">
            <div className="inline-flex items-center bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                <button
                    onClick={() => setView('add')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        view === 'add' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-gray-50'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    New Answer Key
                </button>
                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                <button
                    onClick={() => setView('list')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        view === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-gray-50'
                    }`}
                >
                    <ListFilter className="w-4 h-4" />
                    All Answer Keys
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] border border-gray-200 font-bold">
                        {exams?.length || 0}
                    </span>
                </button>
            </div>
            {view === 'list' && (
                 <Button variant="outline" size="sm" onClick={fetchExams} disabled={isFetching}>
                    <RefreshCcw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh
                 </Button>
            )}
        </div>

        {/* --- ADD FORM --- */}
        {view === 'add' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">New Answer Key</h2>
                        <p className="text-sm text-slate-500">Marks are auto-set based on Category.</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        
                        {/* LEFT: Inputs */}
                        <div className="md:col-span-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold">Key Name</Label>
                                    <Input 
                                        name="name" 
                                        value={examName}
                                        onChange={handleNameChange}
                                        placeholder="e.g. SSC CGL 2025 Tier-1" 
                                        required 
                                        className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold">Category</Label>
                                   <Select 
                                        name="type" 
                                        value={category} 
                                        onValueChange={handleCategoryChange}
                                    >
                                     <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white">
                                       <SelectValue placeholder="Select type" />
                                     </SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="SSC">SSC (Staff Selection)</SelectItem>
                                       <SelectItem value="RRB">RRB (Railway)</SelectItem>
                                       <SelectItem value="BANK">Banking</SelectItem>
                                       <SelectItem value="OTHERS">Others</SelectItem>
                                     </SelectContent>
                                   </Select>
                                </div>
                            </div>

                            {/* MARKING SCHEME */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold">Total Ques</Label>
                                    <Input 
                                        name="total_questions" 
                                        type="number"
                                        placeholder="100" 
                                        value={totalQues}
                                        onChange={(e) => setTotalQues(e.target.value)}
                                        required 
                                        className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold text-green-600">Right (+)</Label>
                                    <Input 
                                        name="right_mark" 
                                        type="number"
                                        step="0.01"
                                        value={rightMark}
                                        onChange={(e) => setRightMark(e.target.value)}
                                        required 
                                        className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold text-red-500">Wrong (-)</Label>
                                    <Input 
                                        name="wrong_mark" 
                                        type="number"
                                        step="0.000001" // High precision step allowed
                                        value={wrongMark}
                                        onChange={(e) => setWrongMark(e.target.value)}
                                        required 
                                        className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all" 
                                    />
                                    {category === 'RRB' && (
                                        <p className="text-[10px] text-amber-600 font-medium leading-tight">
                                            *High precision set for accurate 1/3 deduction.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold">Target URL (Slug)</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-mono text-sm">rankmatters.in/</span>
                                    </div>
                                    <Input 
                                        name="url" 
                                        value={slug}
                                        onChange={handleSlugChange}
                                        placeholder="ssc-cgl-tier1-key" 
                                        required 
                                        className="h-11 pl-35 bg-gray-50 border-gray-200 font-mono text-sm focus:bg-white transition-all text-blue-600" 
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400">Unique identifier for the answer key page.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold">Description</Label>
                                <Textarea name="description" placeholder="Enter brief details about the exam..." rows={3} className="bg-gray-50 border-gray-200 resize-none focus:bg-white transition-all p-4" />
                            </div>
                        </div>

                        {/* RIGHT: Upload */}
                        <div className="md:col-span-4 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider font-bold">Icon (500x500)</Label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative group border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'}`}
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
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center border border-green-200 shrink-0">
                                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <p className="text-sm font-medium text-green-800 truncate">{selectedFile.name}</p>
                                                <p className="text-xs text-green-600">Ready to upload</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4">
                                            <div className="bg-white p-3 rounded-full shadow-sm mb-3 mx-auto w-fit group-hover:scale-110 transition-transform">
                                                <Upload className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-700">Upload Icon</p>
                                            <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 1MB</p>
                                        </div>
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
                                            <Loader2 className="animate-spin w-4 h-4" /> Publishing...
                                        </span>
                                    ) : (
                                        'Publish Answer Key'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
          </div>
        )}

        {/* --- LIST VIEW --- */}
         {view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {isFetching ? (
                <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-60">
                    <Loader2 className="animate-spin text-slate-900 w-10 h-10 mb-4" />
                    <p className="text-slate-500 text-sm font-medium">Syncing with database...</p>
                </div>
             ) : (!exams || exams.length === 0) ? (
                <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                        <ListFilter className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Answer Keys Found</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-sm text-center">Your published answer keys will appear here. Create a new one to get started.</p>
                </div>
             ) : (
               exams.map((exam) => (
                 <Card key={exam.id} className="group relative flex flex-row overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-white p-4 h-[180px]">
                   <div className="w-[88px] shrink-0 flex flex-col items-center justify-start pt-1 mr-4">
                       <div className="w-[80px] h-[80px] rounded-full p-1 bg-white border border-gray-100 shadow-sm mb-3 group-hover:scale-105 transition-transform">
                           <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                                <img src={exam.imageUrl} alt={exam.examName} className="w-full h-full object-cover" />
                           </div>
                       </div>
                       <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 w-full text-center">
                           ID: {exam.id}
                       </span>
                   </div>

                   <div className="flex flex-col flex-grow justify-between min-w-0">
                       <div>
                           <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    {exam.type}
                                </span>
                           </div>
                           <h3 className="font-bold text-slate-900 text-base leading-tight truncate mb-1" title={exam.examName}>
                               {exam.examName}
                           </h3>
                           
                           <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium mb-1.5 bg-slate-50 p-1 rounded-md w-fit">
                                <div className="flex items-center gap-1" title="Total Questions">
                                    <HelpCircle className="w-3 h-3 text-slate-400" />
                                    <span>{exam.totalQuestions || 'N/A'}</span>
                                </div>
                                <div className="w-px h-3 bg-slate-300"></div>
                                <div className="flex items-center gap-1 text-green-600" title="Marks for Correct">
                                    <Check className="w-3 h-3" />
                                    <span>+{Number(exam.rightMark || 0).toFixed(2)}</span>
                                </div>
                                <div className="w-px h-3 bg-slate-300"></div>
                                <div className="flex items-center gap-1 text-red-500" title="Negative Marking">
                                    <X className="w-3 h-3" />
                                    {/* Display cleaner number for RRB */}
                                    <span>-{Number(exam.wrongMark || 0) > 0.33 && Number(exam.wrongMark || 0) < 0.34 ? '1/3' : Number(exam.wrongMark || 0).toFixed(2)}</span>
                                </div>
                           </div>

                           <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono mb-1">
                                <LinkIcon className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate max-w-[150px]">/{exam.url}</span>
                           </div>
                       </div>

                       <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 h-7 text-[11px] font-medium text-slate-600 hover:bg-slate-50 border-gray-200"
                                onClick={() => copyToClipboard(exam.url)}
                            >
                                <Copy className="w-3 h-3 mr-1.5" />
                                Copy Link
                            </Button>
                            
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(exam.id)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
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