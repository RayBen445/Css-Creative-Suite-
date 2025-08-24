/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// TypeScript declarations for global variables from script tags
interface PreactContext<T> {
    Provider: any;
    Consumer: any;
}

declare var preact: {
    h: any;
    render: any;
    Component: any;
    createContext: <T>(defaultValue: T) => PreactContext<T>;
};
declare var htm: any;
declare var marked: any;

interface PreactHooks {
    useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prevState: T) => T)) => void];
    useEffect: (effect: () => (void | (() => void)), deps?: any[]) => void;
    useRef: <T>(initialValue: T | null) => { current: T | null };
    useCallback: <T extends (...args: any[]) => any>(callback: T, deps: any[]) => T;
    useMemo: <T>(factory: () => T, deps: any[]) => T;
    useContext: <T>(context: PreactContext<T>) => T;
    useLayoutEffect: (effect: () => (void | (() => void)), deps?: any[]) => void;
}
declare var preactHooks: PreactHooks;
declare var JSZip: any;
declare var jspdf: any;
declare var docx: any;


declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// Ensure preact and htm are available from the global scope
const { h, render, Component, createContext } = preact;
const { useState, useEffect, useRef, useCallback, useMemo, useContext, useLayoutEffect } = preactHooks;
const html = htm.bind(h);

// --- SECURE API CALLER ---
// Helper to call our secure backend proxy instead of the Gemini API directly
const callApi = async (action: string, model: string, payload: any) => {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, model, payload }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'API call failed with no valid JSON response.' }));
        throw new Error(err.error || 'API call failed');
    }

    if (action.includes('Stream')) {
        return response.body; // For streaming, return the ReadableStream
    }
    
    if (action === 'fetchVideo') {
        return response.blob(); // For video files, return a Blob
    }

    return response.json();
};

const ADMIN_EMAIL = 'oladoyeheritage445@gmail.com';

const TABS_CONFIG = {
    Home: { icon: 'home', brand: false },
    Projects: { icon: 'folder-tree', brand: false },
    Studio: { icon: 'pen-ruler', brand: false },
    CodeSandbox: { icon: 'codepen', brand: true },
    NovelWriter: { icon: 'book-open', brand: false },
    Chat: { icon: 'comments', brand: false },
    Generator: { icon: 'wand-magic-sparkles', brand: false },
    Toolkit: { icon: 'toolbox', brand: false },
    CSAssistant: { icon: 'laptop-code', brand: false },
    LearningHub: { icon: 'graduation-cap', brand: false },
    Gallery: { icon: 'images', brand: false },
    Blog: { icon: 'newspaper', brand: false },
    Profile: { icon: 'user-circle', brand: false },
    Help: { icon: 'question-circle', brand: false },
    Admin: { icon: 'user-shield', brand: false },
    About: { icon: 'info-circle', brand: false },
};

// --- TYPE DEFINITIONS ---
interface User {
  id: string | number;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  role: 'admin' | 'user';
  isPremium: boolean;
  status: 'active' | 'suspended' | 'banned';
  suspensionEndDate: string | null;
  usage: {
    generations: number;
    chats: number;
    projects: number;
    toolkit: number;
    csAssistant: number;
    quizzes: number;
  };
}

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  likes: number;
  user: string;
  userId: string | number;
  featured?: boolean;
}

interface Task {
  id: string;
  content: string;
  status: 'todo' | 'inprogress' | 'done';
}

interface Project {
  id: string;
  userId: string | number;
  name: string;
  description: string;
  createdAt: string;
  items: GalleryItem[];
  tasks: Task[];
  notes: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  error?: boolean;
}

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  persona: string;
  userId: string | number;
}

interface StudioDocument {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  charCount: number;
  lastModified: number;
  userId: string | number;
  versionHistory: { content: string, date: number }[];
}

interface GlobalSettings {
    logoUrl: string;
    navOrder: string[];
    password: string;
    maintenanceMode: boolean;
    announcement: string;
    featureFlags: { videoGenerator: boolean; newToolkit: boolean; };
    aboutInfo: {
        email: string;
        avatar: string;
        name: string;
        bio: string;
        github: string;
        linkedin: string;
        telegram: string;
    }
}


// --- UTILITY FUNCTIONS ---
const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error('Failed to read file as base64 string.'));
        }
    };
    reader.onerror = error => reject(error);
});

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
};

const generateUniqueId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const upgradeToPro = () => {
    const phoneNumber = '2348075614248';
    const message = encodeURIComponent('I want to upgrade to Pro');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
};


// --- HOOKS ---
const useToast = () => {
    const [toast, setToast] = useState<{show: boolean; message: string; type: string}>({ show: false, message: '', type: 'success' });

    const showToast = (message: string, type = 'success', duration = 3000) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, duration);
    };

    return { showToast, toast };
};

const useModal = () => {
    const [modal, setModal] = useState<{isOpen: boolean; content: any; type: string}>({ isOpen: false, content: null, type: '' });

    const openModal = (content: any, type = '') => setModal({ isOpen: true, content, type });
    const closeModal = () => setModal({ isOpen: false, content: null, type: '' });

    return { modal, openModal, closeModal };
};


// --- APP CONTEXT ---
interface IAppContext {
    theme: string;
    toggleTheme: () => void;
    activeTab: string;
    setActiveTab: (newState: string | ((prevState: string) => string)) => void;
    users: User[];
    setUsers: (newState: User[] | ((prevState: User[]) => User[])) => void;
    currentUser: User | null;
    setCurrentUser: (newState: User | null | ((prevState: User | null) => User | null)) => void;
    projects: Project[];
    setProjects: (newState: Project[] | ((prevState: Project[]) => Project[])) => void;
    activeProjectId: string | null;
    setActiveProjectId: (newState: string | null | ((prevState: string | null) => string | null)) => void;
    galleryItems: GalleryItem[];
    setGalleryItems: (newState: GalleryItem[] | ((prevState: GalleryItem[]) => GalleryItem[])) => void;
    chatSessions: ChatSession[];
    setChatSessions: (newState: ChatSession[] | ((prevState: ChatSession[]) => ChatSession[])) => void;
    activeChatSessionId: string | null;
    setActiveChatSessionId: (newState: string | null | ((prevState: string | null) => string | null)) => void;
    studioDocuments: StudioDocument[];
    setStudioDocuments: (newState: StudioDocument[] | ((prevState: StudioDocument[]) => StudioDocument[])) => void;
    activeStudioDocumentId: string | null;
    setActiveStudioDocumentId: (newState: string | null | ((prevState: string | null) => string | null)) => void;
    csHistory: any[];
    setCsHistory: (newState: any[] | ((prevState: any[]) => any[])) => void;
    learningHubQuizzes: any[];
    setLearningHubQuizzes: (newState: any[] | ((prevState: any[]) => any[])) => void;
    faqs: any[];
    setFaqs: (newState: any[] | ((prevState: any[]) => any[])) => void;
    supportTickets: any[];
    setSupportTickets: (newState: any[] | ((prevState: any[]) => any[])) => void;
    subscriptionPlans: any[];
    setSubscriptionPlans: (newState: any[] | ((prevState: any[]) => any[])) => void;
    discountCodes: any[];
    setDiscountCodes: (newState: any[] | ((prevState: any[]) => any[])) => void;
    blogPosts: any[];
    setBlogPosts: (newState: any[] | ((prevState: any[]) => any[])) => void;
    globalSettings: GlobalSettings;
    setGlobalSettings: (newState: GlobalSettings | ((prevState: GlobalSettings) => GlobalSettings)) => void;
    isAuthenticated: boolean;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    isLockedOut: boolean;
    activityLog: any[];
    logActivity: (action: string, details?: string) => void;
    pageNames: Record<string, string>;
    setPageNames: (newState: Record<string, string> | ((prevState: Record<string, string>) => Record<string, string>)) => void;
    helpContent: Record<string, string>;
    setHelpContent: (newState: Record<string, string> | ((prevState: Record<string, string>) => Record<string, string>)) => void;
    showToast: (message: string, type?: string, duration?: number) => void;
    toast: { show: boolean; message: string; type: string };
    modal: { isOpen: boolean; content: any; type: string };
    openModal: (content: any, type?: string) => void;
    closeModal: () => void;
}

const AppContext = createContext<IAppContext | null>(null);

const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [activeTab, setActiveTab] = useState('Home');
    const [users, setUsers] = useState<User[]>([
        { id: 1, name: 'Heritage Oladoye', email: ADMIN_EMAIL, bio: 'Full-Stack Developer & AI Enthusiast', avatar: 'https://files.catbox.moe/172avo.jpg', role: 'admin', isPremium: true, status: 'active', suspensionEndDate: null, usage: { generations: 0, chats: 0, projects: 0, toolkit: 0, csAssistant: 0, quizzes: 0 } },
        { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com', bio: 'Creative Coder', avatar: `https://i.pravatar.cc/150?u=jane`, role: 'user', isPremium: false, status: 'active', suspensionEndDate: null, usage: { generations: 0, chats: 0, projects: 0, toolkit: 0, csAssistant: 0, quizzes: 0 } },
    ]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
    const [studioDocuments, setStudioDocuments] = useState<StudioDocument[]>([]);
    const [activeStudioDocumentId, setActiveStudioDocumentId] = useState<string | null>(null);
    const [csHistory, setCsHistory] = useState<any[]>([]);
    const [learningHubQuizzes, setLearningHubQuizzes] = useState<any[]>([]);
    const [faqs, setFaqs] = useState<any[]>([
        { q: "What is CSS Creative Suite?", a: "It's an all-in-one AI-powered platform for developers and designers to create, manage, and explore creative projects." },
        { q: "How do I upgrade to Premium?", a: "You can upgrade to a Premium plan from your Profile page to unlock all features, including unlimited generations and advanced AI tools." },
        { q: "Can I use my creations commercially?", a: "Creations are subject to the terms of service of the underlying AI models. Please review our policies for detailed information." },
        { q: "How does the Code Sandbox AI work?", a: "The AI in the Code Sandbox can generate HTML, CSS, and JavaScript from a text prompt, helping you quickly prototype ideas. This is a premium feature." },
    ]);
    const [supportTickets, setSupportTickets] = useState<any[]>([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState([
        { id: 'plan1', name: 'Standard', price: 'Free', features: ['100 Generations/month', 'Limited AI Tools', 'Basic Support', '5 Projects', '3 Studio Docs'] },
        { id: 'plan2', name: 'Premium', price: '$9.99/month', features: ['Unlimited Generations', 'Full AI Toolkit Access', 'Priority Support', 'Unlimited Projects', 'Unlimited Studio Docs'] },
    ]);
    const [discountCodes, setDiscountCodes] = useState([
        { id: 'code1', code: 'WELCOME10', discount: '10%', active: true },
        { id: 'code2', code: 'SUMMER20', discount: '20%', active: false },
    ]);
    const [blogPosts, setBlogPosts] = useState([
        { id: 'blog1', title: 'Welcome to the CSS Creative Suite!', content: 'Welcome! This is your new creative playground. Explore the tools, generate amazing content, and manage your projects all in one place. Head over to the **Generator** to create your first image, or try the **Code Sandbox** to prototype a new idea. We\'re excited to see what you build!', authorName: 'Heritage Oladoye', authorAvatar: 'https://files.catbox.moe/172avo.jpg', createdAt: new Date().toISOString(), tags: ['Welcome', 'Getting Started'], isPublished: true },
        { id: 'blog2', title: 'Unlocking Creativity with AI Generators', content: 'AI image and video generation is not just a novelty; it\'s a powerful tool for designers and developers. Learn how to craft effective prompts, iterate on ideas, and integrate AI-generated assets into your projects seamlessly.', authorName: 'Heritage Oladoye', authorAvatar: 'https://files.catbox.moe/172avo.jpg', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), tags: ['AI', 'Design', 'Creativity'], isPublished: true },
    ]);
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
        logoUrl: 'https://files.catbox.moe/515e01.png',
        navOrder: Object.keys(TABS_CONFIG),
        password: 'professor',
        maintenanceMode: false,
        announcement: 'Welcome to the new and improved CSS Creative Suite! Check out the new Blog and Code Sandbox!',
        featureFlags: { videoGenerator: true, newToolkit: true },
        aboutInfo: {
            email: 'oladoyeheritage445@gmail.com',
            avatar: 'https://files.catbox.moe/172avo.jpg',
            name: 'Heritage Oladoye',
            bio: 'Full-Stack Developer & AI Enthusiast',
            github: 'https://github.com/Oladoye-Heritage',
            linkedin: 'https://www.linkedin.com/in/heritage-oladoye-8712a021b/',
            telegram: 'https://t.me/+2348075614248',
        }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [activityLog, setActivityLog] = useState<any[]>([]);
    const [pageNames, setPageNames] = useState(Object.keys(TABS_CONFIG).reduce((acc, key) => ({...acc, [key]: key}), {}));
    const [helpContent, setHelpContent] = useState({
        Home: 'The Home page provides a quick overview of your activity, usage stats, and quick actions to jump into your favorite tools. It\'s your central dashboard for creativity.',
        Projects: 'Manage all your creative projects here. Each project is a workspace where you can organize assets, track tasks with a Kanban board (Premium), and keep notes.',
        Studio: 'The Studio is your personal writing space. Draft blog posts, documentation, or any text-based content. Use AI-powered tools to summarize, improve, and even continue your writing (Premium).',
        CodeSandbox: 'A live coding environment for HTML, CSS, and JavaScript. Prototype ideas, test snippets, or build entire components. Premium users can use AI to generate code from a prompt and download projects as a ZIP file.',
        NovelWriter: 'Unleash your inner author with the AI Novel Writer. Provide a title and chapter count, and let the AI craft a story for you. Download your finished work as a PDF or DOCX file.',
        Chat: 'Engage in conversation with our powerful AI assistant. Use different personas for specialized help, whether you need a CSS expert or a creative writer.',
        Generator: 'Bring your ideas to life by generating stunning images and videos (Premium) from text prompts. Add your creations to projects or the public gallery.',
        Toolkit: 'A suite of specialized AI tools to accelerate your design workflow. Generate color palettes, CSS gradients, SVG shapes, animations, and more from simple text descriptions.',
        CSAssistant: 'Your personal coding assistant. Get code explanations, optimizations, and debugging help. Premium users can translate code between languages, generate unit tests, and check for accessibility issues.',
        LearningHub: 'Test your knowledge on any topic by generating custom quizzes. Get instant feedback and explanations to help you learn and grow.',
        Gallery: 'Explore creations from the entire community. Get inspired by prompts and see what others are building with the AI generator.',
        Blog: 'Read the latest news, tutorials, and announcements from the CSS Creative Suite team.',
        Profile: 'Manage your profile information, view your usage stats, and upgrade to a Premium plan to unlock all features.',
    });
    
    const { showToast, toast } = useToast();
    const { modal, openModal, closeModal } = useModal();

    const logActivity = useCallback((action: string, details = '') => {
        if (!currentUser) return;
        const newLogEntry = {
            id: generateUniqueId(),
            userId: currentUser.id,
            userName: currentUser.name,
            userEmail: currentUser.email,
            action,
            details,
            timestamp: new Date().toISOString(),
        };
        setActivityLog(prev => [newLogEntry, ...prev].slice(0, 200)); // Keep last 200 activities
    }, [currentUser]);

    useEffect(() => {
        document.body.className = '';
        document.body.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
        if (loggedInUserEmail) {
            const user = users.find(u => u.email.toLowerCase() === loggedInUserEmail.toLowerCase());
            if (user) {
                if (user.status === 'suspended' && user.suspensionEndDate && new Date() > new Date(user.suspensionEndDate)) {
                    const reactivatedUser = { ...user, status: 'active' as const, suspensionEndDate: null };
                    setUsers(users.map(u => u.id === user.id ? reactivatedUser : u));
                    setCurrentUser(reactivatedUser);
                    setIsAuthenticated(true);
                    setIsLockedOut(false);
                } else {
                     setCurrentUser(user);
                     setIsAuthenticated(true);
                }
            } else {
                sessionStorage.removeItem('loggedInUserEmail');
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        }
    }, [users]);

    useEffect(() => {
        if (currentUser) {
            if (currentUser.status === 'banned') {
                setIsLockedOut(true);
            } else if (currentUser.status === 'suspended' && currentUser.suspensionEndDate && new Date() < new Date(currentUser.suspensionEndDate)) {
                setIsLockedOut(true);
            } else {
                setIsLockedOut(false);
            }
        } else {
            setIsLockedOut(false);
        }
    }, [currentUser]);
    
    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    const login = (email: string, password: string) => {
        if (password === globalSettings.password) {
            let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (!user) {
                const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                user = {
                    id: generateUniqueId(),
                    name: name || 'New User',
                    email: email,
                    bio: '',
                    avatar: `https://i.pravatar.cc/150?u=${email}`,
                    role: 'user',
                    isPremium: false,
                    status: 'active',
                    suspensionEndDate: null,
                    usage: { generations: 0, chats: 0, projects: 0, toolkit: 0, csAssistant: 0, quizzes: 0 },
                };
                setUsers(prevUsers => [user, ...prevUsers]);
                showToast(`Welcome, ${user.name}! Your account has been created.`, 'success');
            } else {
                 if (user.status === 'banned') {
                    showToast('This account is banned.', 'error');
                    return false;
                }
                 if (user.status === 'suspended' && user.suspensionEndDate && new Date() < new Date(user.suspensionEndDate)) {
                    showToast(`This account is suspended until ${new Date(user.suspensionEndDate).toLocaleString()}.`, 'error');
                    return false;
                }
                showToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
            }
            
            sessionStorage.setItem('loggedInUserEmail', user.email);
            setCurrentUser(user);
            setIsAuthenticated(true);
            setActiveTab('Home');
            
            const newLogEntry = {
                id: generateUniqueId(),
                userId: user.id, userName: user.name, userEmail: user.email,
                action: 'Logged In', details: '', timestamp: new Date().toISOString(),
            };
            setActivityLog(prev => [newLogEntry, ...prev].slice(0, 200));

            const welcomeSeen = localStorage.getItem(`welcomeModalSeen_${user.id}`);
            if (!welcomeSeen) {
                openModal(html`<${WelcomeModal} closeModal=${closeModal} setActiveTab=${setActiveTab} />`, 'welcome-modal');
                localStorage.setItem(`welcomeModalSeen_${user.id}`, 'true');
            }

            return true;
        }
        return false;
    };
    
    const logout = () => {
        logActivity('Logged Out');
        sessionStorage.removeItem('loggedInUserEmail');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsLockedOut(false);
        setActiveProjectId(null);
        showToast('You have been logged out.', 'success');
    };

    const value: IAppContext = {
        theme, toggleTheme,
        activeTab, setActiveTab,
        users, setUsers,
        currentUser, setCurrentUser,
        projects, setProjects,
        activeProjectId, setActiveProjectId,
        galleryItems, setGalleryItems,
        chatSessions, setChatSessions,
        activeChatSessionId, setActiveChatSessionId,
        studioDocuments, setStudioDocuments,
        activeStudioDocumentId, setActiveStudioDocumentId,
        csHistory, setCsHistory,
        learningHubQuizzes, setLearningHubQuizzes,
        faqs, setFaqs,
        supportTickets, setSupportTickets,
        subscriptionPlans, setSubscriptionPlans,
        discountCodes, setDiscountCodes,
        blogPosts, setBlogPosts,
        globalSettings, setGlobalSettings,
        isAuthenticated, login, logout, isLockedOut,
        activityLog, logActivity,
        pageNames, setPageNames,
        helpContent, setHelpContent,
        showToast, toast,
        modal, openModal, closeModal
    };

    return html`<${AppContext.Provider} value=${value}>${children}</${AppContext.Provider}>`;
};


// --- UI COMPONENTS ---

const Loader = ({ text = 'Loading...' }) => html`
    <div class="loader-container">
        <div class="loader"></div>
        <p>${text}</p>
    </div>
`;

const Toast = ({ message, type, show }) => {
    return html`
        <div class="toast-notification ${type} ${show ? 'show' : ''}">
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-xmark-circle'}"></i>
            ${message}
        </div>
    `;
};

const Modal = ({ isOpen, closeModal, children, type = '' }) => {
    if (!isOpen) return null;
    return html`
        <div class="modal-overlay" onClick=${closeModal}>
            <div class="modal-content ${type}" onClick=${e => e.stopPropagation()}>
                <button class="modal-close-btn" onClick=${closeModal} aria-label="Close modal">&times;</button>
                ${children}
            </div>
        </div>
    `;
};

const WelcomeModal = ({ closeModal, setActiveTab }) => {
    return html`
        <div class="welcome-modal-content">
            <img src="https://files.catbox.moe/515e01.png" alt="Logo" class="welcome-logo" />
            <h2>Welcome to the CSS Creative Suite!</h2>
            <p>Your all-in-one AI-powered toolkit for creativity and development. Here are a few things you can do to get started:</p>
            <div class="welcome-features">
                <div class="welcome-feature-item">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <h4>Create Something New</h4>
                    <p>Use the <strong>Generator</strong> to bring your ideas to life with AI-generated images and videos.</p>
                </div>
                <div class="welcome-feature-item">
                    <i class="fa-brands fa-codepen"></i>
                    <h4>Build & Test</h4>
                    <p>Jump into the <strong>Code Sandbox</strong> to prototype ideas with HTML, CSS, and JavaScript.</p>
                </div>
                <div class="welcome-feature-item">
                    <i class="fa-solid fa-folder-tree"></i>
                    <h4>Stay Organized</h4>
                    <p>Manage your work with <strong>Projects</strong>, where you can save assets, tasks, and notes.</p>
                </div>
            </div>
            <div class="welcome-actions">
                <button class="secondary-btn" onClick=${() => { setActiveTab('Help'); closeModal(); }}>Read the Guide</button>
                <button onClick=${closeModal}>Start Exploring</button>
            </div>
        </div>
    `;
};

const GlobalSearchModal = ({ closeModal }) => {
    const { 
        projects, studioDocuments, galleryItems, blogPosts, currentUser,
        setActiveTab, setActiveProjectId, setActiveStudioDocumentId, pageNames
    } = useContext(AppContext)!;
    const [searchTerm, setSearchTerm] = useState('');

    const searchResults = useMemo(() => {
        if (!searchTerm.trim() || !currentUser) {
            return { projects: [], docs: [], gallery: [], blog: [] };
        }
        const lowerCaseTerm = searchTerm.toLowerCase();
        
        const userProjects = projects.filter(p => p.userId === currentUser.id);

        return {
            projects: userProjects.filter(p => 
                p.name.toLowerCase().includes(lowerCaseTerm) || 
                p.description.toLowerCase().includes(lowerCaseTerm)
            ),
            docs: studioDocuments.filter(d => 
                d.title.toLowerCase().includes(lowerCaseTerm) ||
                d.content.toLowerCase().includes(lowerCaseTerm)
            ),
            gallery: galleryItems.filter(g => g.prompt.toLowerCase().includes(lowerCaseTerm)),
            blog: blogPosts.filter(b => 
                (b.isPublished || currentUser.role === 'admin') &&
                (b.title.toLowerCase().includes(lowerCaseTerm) || b.content.toLowerCase().includes(lowerCaseTerm))
            )
        };
    }, [searchTerm, projects, studioDocuments, galleryItems, blogPosts, currentUser]);
    
    const handleNav = (tab: string, id: string | null) => {
        setActiveTab(tab);
        if (tab === 'Projects' && id) setActiveProjectId(id);
        if (tab === 'Studio' && id) setActiveStudioDocumentId(id);
        closeModal();
    };

    return html`
        <div class="global-search-container">
            <div class="global-search-bar">
                <i class="fa-solid fa-search"></i>
                <input 
                    type="text" 
                    placeholder="Search across projects, documents, gallery..." 
                    value=${searchTerm} 
                    onInput=${e => setSearchTerm(e.target.value)} 
                    autoFocus 
                />
            </div>
            <div class="global-search-results">
                ${searchTerm.trim() ? html`
                    ${searchResults.projects.length > 0 && html`
                        <div class="search-category">
                            <h4>${pageNames.Projects}</h4>
                            ${searchResults.projects.map(p => html`
                                <div class="search-result-item" onClick=${() => handleNav('Projects', p.id)}>
                                    <i class="fa-solid fa-folder-tree"></i>
                                    <div>
                                        <strong>${p.name}</strong>
                                        <p>${p.description.substring(0, 100)}...</p>
                                    </div>
                                </div>
                            `)}
                        </div>
                    `}
                    ${searchResults.docs.length > 0 && html`
                        <div class="search-category">
                            <h4>${pageNames.Studio}</h4>
                            ${searchResults.docs.map(d => html`
                                <div class="search-result-item" onClick=${() => handleNav('Studio', d.id)}>
                                    <i class="fa-solid fa-file-alt"></i>
                                    <div>
                                        <strong>${d.title}</strong>
                                        <p>${d.content.substring(0, 100)}...</p>
                                    </div>
                                </div>
                            `)}
                        </div>
                    `}
                    ${searchResults.gallery.length > 0 && html`
                        <div class="search-category">
                            <h4>${pageNames.Gallery} Items</h4>
                            ${searchResults.gallery.map(g => html`
                                <div class="search-result-item" onClick=${() => handleNav('Gallery', null)}>
                                    <i class="fa-solid fa-image"></i>
                                    <div>
                                        <strong>Prompt</strong>
                                        <p>${g.prompt.substring(0, 100)}...</p>
                                    </div>
                                </div>
                            `)}
                        </div>
                    `}
                    ${searchResults.blog.length > 0 && html`
                        <div class="search-category">
                            <h4>${pageNames.Blog} Posts</h4>
                            ${searchResults.blog.map(b => html`
                                <div class="search-result-item" onClick=${() => handleNav('Blog', null)}>
                                    <i class="fa-solid fa-newspaper"></i>
                                    <div>
                                        <strong>${b.title}</strong>
                                        <p>${b.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
                                    </div>
                                </div>
                            `)}
                        </div>
                    `}
                    ${Object.values(searchResults).every((arr: any[]) => arr.length === 0) && html`
                        <div class="placeholder-text"><p class="no-results">No results found for "${searchTerm}"</p></div>
                    `}
                ` : html`
                     <div class="placeholder-text"><p class="no-results">Start typing to search.</p></div>
                `}
            </div>
        </div>
    `;
};

const AccessDeniedView = () => {
    const { currentUser, logout } = useContext(AppContext)!;

    let message, subMessage, timeInfo = null;

    if (currentUser?.status === 'banned') {
        message = 'Account Banned';
        subMessage = 'Your account has been permanently banned due to a violation of our terms of service. You no longer have access to the CSS Creative Suite.';
    } else if (currentUser?.status === 'suspended' && currentUser.suspensionEndDate) {
        message = 'Account Suspended';
        subMessage = 'Your account has been temporarily suspended. Access will be restored after the suspension period ends.';
        timeInfo = new Date(currentUser.suspensionEndDate).toLocaleString();
    }

    return html`
        <div class="access-denied-container">
            <div class="access-denied-card">
                <i class="fa-solid fa-ban"></i>
                <h2>${message}</h2>
                <p>${subMessage}</p>
                ${timeInfo && html`<div class="suspension-time">Suspended Until: ${timeInfo}</div>`}
                <button onClick=${logout} style=${{marginTop: '1rem'}}>Logout</button>
            </div>
        </div>
    `;
};

const PasswordProtect = ({ children }) => {
    const { isAuthenticated, login, isLockedOut, currentUser, globalSettings } = useContext(AppContext)!;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!login(email, password)) {
             if (!error) { // Avoid overwriting specific errors from login function
                setError('Incorrect password. Please try again.');
            }
        }
    };

    if (isAuthenticated) {
        if (isLockedOut) {
            return html`<${AccessDeniedView} />`;
        }
        return children;
    }

    return html`
        <div class="login-container">
            <form class="login-form" onSubmit=${handleSubmit}>
                <h2>
                    <img src=${globalSettings.logoUrl} alt="Logo" width="32" height="32" class="header-logo" />
                    CSS Creative Suite
                </h2>
                <p>Please enter your email and the password to access the application.</p>
                ${error && html`<p class="login-error">${error}</p>`}
                <input 
                    type="email" 
                    value=${email} 
                    onInput=${e => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    aria-label="Email"
                />
                <div class="password-input-wrapper">
                    <input 
                        type=${showPassword ? 'text' : 'password'} 
                        value=${password} 
                        onInput=${e => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        aria-label="Password"
                    />
                    <button type="button" class="password-toggle-btn" onClick=${() => setShowPassword(!showPassword)} aria-label=${showPassword ? 'Hide password' : 'Show password'}>
                        <i class="fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    </button>
                </div>
                <button type="submit">Unlock</button>
            </form>
        </div>
    `;
};

const MaintenanceView = () => {
    const { currentUser, globalSettings, setGlobalSettings } = useContext(AppContext)!;
    return html`
        <div class="maintenance-view">
            <div class="maintenance-card">
                <i class="fa-solid fa-tools"></i>
                <h2>Under Maintenance</h2>
                <p>CSS Creative Suite is currently undergoing scheduled maintenance. All features are temporarily disabled. We'll be back shortly. Thank you for your patience!</p>
                ${currentUser?.role === 'admin' && html`
                    <button onClick=${() => setGlobalSettings({...globalSettings, maintenanceMode: false})}>Turn Off Maintenance Mode</button>
                `}
            </div>
        </div>
    `;
};

const UsageCounter = ({ textCenter = false }) => {
    const { currentUser } = useContext(AppContext)!;
    if (!currentUser || currentUser.isPremium) return null;
    return html`
        <div class="usage-counter ${textCenter ? 'text-center' : ''}">
            Generations: ${currentUser.usage.generations} / 100
        </div>
    `;
};

const MediaPreviewModal = ({ item, closeModal }) => {
    if (!item) return null;

    const handleDownload = async (e: Event) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = item.url;
        const fileExtension = item.type === 'image' 
            ? (item.url.includes('jpeg') ? 'jpeg' : 'png') 
            : 'mp4';
        link.download = `creation-${item.prompt.slice(0, 20).replace(/\s/g, '_')}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return html`
        <div class="modal-content media-preview-modal" onClick=${closeModal}>
            <div class="media-container" onClick=${e => e.stopPropagation()}>
                ${item.type === 'image' ? html`<img src=${item.url} alt=${item.prompt} />` : ''}
                ${item.type === 'video' ? html`<video src=${item.url} controls autoplay loop />` : ''}
            </div>
            <div class="media-details">
                <div class="media-prompt">${item.prompt}</div>
                <button class="download-btn" onClick=${handleDownload}><i class="fa-solid fa-download"></i> Download Media</button>
            </div>
        </div>
    `;
};

const SupportModal = ({ closeModal }) => {
    const { faqs, showToast, globalSettings, setSupportTickets, currentUser, logActivity } = useContext(AppContext)!;
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmitTicket = (e) => {
        e.preventDefault();
        const newTicket = {
            id: generateUniqueId(),
            userId: currentUser!.id,
            subject,
            description,
            status: 'open',
            createdAt: new Date().toISOString()
        };
        setSupportTickets(prev => [...prev, newTicket]);
        logActivity('Submitted Support Ticket', subject);
        showToast('Support ticket submitted!', 'success');
        setSubject('');
        setDescription('');
        closeModal();
    };

    return html`
        <h2>Support & Help</h2>
        <div class="support-columns">
            <div class="support-col">
                <h3><i class="fa-solid fa-life-ring"></i> Get Help</h3>
                <ul class="support-list">
                    <li>
                        <i class="fa-brands fa-whatsapp"></i>
                        <a href="https://wa.me/2348075614248" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
                    </li>
                    <li>
                        <i class="fa-solid fa-envelope"></i>
                        <span>${globalSettings.aboutInfo.email}</span>
                    </li>
                </ul>
                <h3 style=${{ marginTop: '1.5rem' }}><i class="fa-solid fa-paper-plane"></i> Submit a Ticket</h3>
                <form class="support-ticket-form" onSubmit=${handleSubmitTicket}>
                    <input type="text" placeholder="Subject" value=${subject} onInput=${e => setSubject(e.target.value)} required />
                    <textarea rows="4" placeholder="Describe your issue..." value=${description} onInput=${e => setDescription(e.target.value)} required></textarea>
                    <button type="submit">Submit Ticket</button>
                </form>
            </div>
            <div class="support-col">
                <h3><i class="fa-solid fa-circle-question"></i> FAQs</h3>
                <div class="faq-list">
                    ${faqs.length > 0 ? faqs.map(faq => html`
                        <details class="faq-item">
                            <summary>${faq.q}</summary>
                            <p>${faq.a}</p>
                        </details>
                    `) : html`<p>No FAQs available yet.</p>`}
                </div>
            </div>
        </div>
    `;
};

const AddToProjectModal = ({ item, onSave, closeModal }) => {
    const { projects, currentUser } = useContext(AppContext);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const userProjects = projects.filter(p => p.userId === currentUser.id);

    return html`
        <h2>Add to...</h2>
        <div class="modal-form">
            <p>Add this creation to the public gallery and optionally to one of your projects.</p>
            <label for="project-select">Select Project (optional)</label>
            <select id="project-select" value=${selectedProjectId} onChange=${e => setSelectedProjectId(e.target.value)}>
                <option value="">None</option>
                ${userProjects.map(p => html`<option value=${p.id}>${p.name}</option>`)}
            </select>
            <div class="form-actions">
                 <button type="button" class="secondary-btn" onClick=${closeModal}>Cancel</button>
                <button type="button" onClick=${() => { onSave(selectedProjectId); closeModal(); }}>Add to Gallery</button>
            </div>
        </div>
    `;
};

const BlogEditModal = ({ post, onSave, closeModal }) => {
    const { currentUser } = useContext(AppContext);
    const [title, setTitle] = useState(post ? post.title : '');
    const [content, setContent] = useState(post ? post.content : '');

    const handleSave = () => {
        if (!title.trim() || !content.trim()) return;
        const newPostData = {
            ...(post || {}),
            id: post ? post.id : generateUniqueId(),
            title,
            content,
            authorName: currentUser.name,
            authorAvatar: currentUser.avatar,
            createdAt: post ? post.createdAt : new Date().toISOString(),
            tags: post ? post.tags : [],
            isPublished: post ? post.isPublished : false,
        };
        onSave(newPostData);
        closeModal();
    };

    return html`
        <h2>${post ? 'Edit' : 'Create'} Blog Post</h2>
        <form class="modal-form" onSubmit=${e => { e.preventDefault(); handleSave(); }}>
            <label for="blog-title">Title</label>
            <input id="blog-title" type="text" value=${title} onInput=${e => setTitle(e.target.value)} required />
            <label for="blog-content">Content (Markdown supported)</label>
            <textarea id="blog-content" rows="10" value=${content} onInput=${e => setContent(e.target.value)} required></textarea>
            <div class="form-actions">
                <button type="button" class="secondary-btn" onClick=${closeModal}>Cancel</button>
                <button type="submit">Save Post</button>
            </div>
        </form>
    `;
};

const AboutEditModal = ({ settings, onSave, closeModal }) => {
    const [formState, setFormState] = useState(settings.aboutInfo);

    const handleInputChange = (e) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        onSave({ ...settings, aboutInfo: formState });
        closeModal();
    };

    return html`
        <h2>Edit About Information</h2>
        <form class="modal-form" onSubmit=${e => { e.preventDefault(); handleSave(); }}>
            <label>Name</label><input name="name" type="text" value=${formState.name} onInput=${handleInputChange} />
            <label>Avatar URL</label><input name="avatar" type="text" value=${formState.avatar} onInput=${handleInputChange} />
            <label>Bio</label><textarea name="bio" rows="3" onInput=${handleInputChange}>${formState.bio}</textarea>
            <label>Email</label><input name="email" type="email" value=${formState.email} onInput=${handleInputChange} />
            <label>GitHub URL</label><input name="github" type="text" value=${formState.github} onInput=${handleInputChange} />
            <label>LinkedIn URL</label><input name="linkedin" type="text" value=${formState.linkedin} onInput=${handleInputChange} />
            <label>Telegram URL</label><input name="telegram" type="text" value=${formState.telegram} onInput=${handleInputChange} />
            <div class="form-actions">
                <button type="button" class="secondary-btn" onClick=${closeModal}>Cancel</button>
                <button type="submit">Save Changes</button>
            </div>
        </form>
    `;
};


// --- VIEW COMPONENTS ---

const HomeView = () => {
    const { pageNames, setActiveTab, projects, currentUser, studioDocuments } = useContext(AppContext)!;
    
    if (!currentUser) return html`<${Loader} />`;

    const userProjects = projects.filter(p => p.userId === currentUser.id);
    const userDocuments = studioDocuments.filter(d => d.userId === currentUser.id);

    return html`
        <div class="home-container">
            <div class="home-header">
                <h2>Welcome back, ${currentUser.name.split(' ')[0]}!</h2>
                <p>Your creative dashboard is ready. Let's build something amazing today.</p>
            </div>

            <div class="home-grid">
                <div class="home-main-content">
                    <h3><i class="fa-solid fa-bolt"></i> Quick Actions</h3>
                    <div class="quick-actions-grid">
                        <div class="quick-action-card" onClick=${() => setActiveTab('Generator')}>
                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                            <span>New Generation</span>
                        </div>
                        <div class="quick-action-card" onClick=${() => setActiveTab('CodeSandbox')}>
                            <i class="fa-brands fa-codepen"></i>
                            <span>${pageNames.CodeSandbox}</span>
                        </div>
                        <div class="quick-action-card" onClick=${() => setActiveTab('Studio')}>
                            <i class="fa-solid fa-pen-ruler"></i>
                            <span>Write in Studio</span>
                        </div>
                        <div class="quick-action-card" onClick=${() => setActiveTab('NovelWriter')}>
                             <i class="fa-solid fa-book-open"></i>
                            <span>${pageNames.NovelWriter}</span>
                        </div>
                    </div>

                    <h3><i class="fa-solid fa-folder-tree"></i> Recent Projects</h3>
                     <div class="home-projects-list">
                        ${userProjects.length > 0 ? userProjects.slice(0, 3).map(p => html`
                            <div class="project-card-mini" onClick=${() => {setActiveTab('Projects');}}>
                                <h4>${p.name}</h4>
                                <p>${p.description.substring(0, 50)}...</p>
                            </div>
                        `) : html`
                            <div class="placeholder-text-mini">
                                <p>You haven't started any projects yet.</p>
                                <button class="secondary-btn" onClick=${() => setActiveTab('Projects')}>Go to Projects</button>
                            </div>
                        `}
                    </div>
                </div>

                <div class="home-sidebar">
                    <div class="usage-summary-card">
                         ${currentUser.isPremium ? html`
                            <div class="premium-user-usage">
                                <i class="fa-solid fa-star"></i>
                                <h3>Premium Access</h3>
                                <p>You have unlimited access to all features.</p>
                            </div>
                         ` : html`
                            <h3><i class="fa-solid fa-chart-line"></i> Usage Summary</h3>
                            <div class="usage-list">
                                <div class="usage-item">
                                    <span>Generations</span>
                                    <strong>${currentUser.usage.generations} / 100</strong>
                                </div>
                                 <div class="usage-item">
                                    <span>Studio Documents</span>
                                    <strong>${userDocuments.length} / 3</strong>
                                </div>
                                <div class="usage-item">
                                    <span>Projects</span>
                                    <strong>${userProjects.length} / 5</strong>
                                </div>
                            </div>
                            <button class="upgrade-btn-sidebar" onClick=${upgradeToPro}>Upgrade to Premium</button>
                         `}
                    </div>
                </div>
            </div>
        </div>
    `;
};

const ProjectEditModal = ({ project, onSave, closeModal }) => {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);

    const handleSave = () => {
        onSave(project.id, { name, description });
        closeModal();
    };

    return html`
        <h2>Edit Project</h2>
        <form class="modal-form" onSubmit=${e => { e.preventDefault(); handleSave(); }}>
            <label for="edit-proj-name">Project Name</label>
            <input id="edit-proj-name" type="text" value=${name} onInput=${e => setName(e.target.value)} />

            <label for="edit-proj-desc">Project Description</label>
            <textarea id="edit-proj-desc" rows="4" value=${description} onInput=${e => setDescription(e.target.value)}></textarea>
            
            <div class="form-actions">
                <button type="button" class="secondary-btn" onClick=${closeModal}>Cancel</button>
                <button type="submit">Save Changes</button>
            </div>
        </form>
    `;
};

const ProjectsView = () => {
    const { projects, setProjects, currentUser, showToast, openModal, closeModal, activeProjectId, setActiveProjectId, logActivity, pageNames } = useContext(AppContext)!;
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');

    const userProjects = useMemo(() => projects.filter(p => p.userId === currentUser!.id), [projects, currentUser!.id]);
    const activeProject = useMemo(() => userProjects.find(p => p.id === activeProjectId), [userProjects, activeProjectId]);

    const handleCreateProject = (e) => {
        e.preventDefault();
        if (newProjectName.trim() === '') {
            showToast('Project name is required', 'error');
            return;
        }
        if (!currentUser!.isPremium && userProjects.length >= 5) {
            showToast('Free users can create up to 5 projects. Please upgrade.', 'error');
            upgradeToPro();
            return;
        }
        const newProject: Project = {
            id: generateUniqueId(),
            userId: currentUser!.id,
            name: newProjectName,
            description: newProjectDesc,
            createdAt: new Date().toISOString().split('T')[0],
            items: [],
            tasks: [],
            notes: '',
        };
        setProjects([newProject, ...projects]);
        logActivity('Created Project', newProject.name);
        setNewProjectName('');
        setNewProjectDesc('');
        setIsCreating(false);
        showToast('Project created successfully', 'success');
        setActiveProjectId(newProject.id); // Open the new project
    };

    const deleteProject = (id: string, e: Event) => {
        e.stopPropagation();
        const projectName = projects.find(p => p.id === id)?.name || 'Unknown';
        if (confirm(`Are you sure you want to delete the project "${projectName}"?`)) {
            setProjects(projects.filter(p => p.id !== id));
            logActivity('Deleted Project', projectName);
            if(activeProjectId === id) setActiveProjectId(null);
            showToast('Project deleted', 'success');
        }
    };
    
    const saveProject = (id: string, updatedData: Partial<Project>) => {
        setProjects(projects.map(p => p.id === id ? { ...p, ...updatedData } : p));
        logActivity('Updated Project', updatedData.name || projects.find(p=>p.id===id)!.name);
        showToast('Project updated successfully!', 'success');
    };

    const openEditModal = (project: Project, e: Event) => {
        e.stopPropagation();
        openModal(html`<${ProjectEditModal} project=${project} onSave=${saveProject} closeModal=${closeModal} />`, 'edit-modal');
    };
    
    if (activeProjectId && activeProject) {
        return html`<${ProjectDetailView} project=${activeProject} setProject=${(updatedData: Partial<Project>) => saveProject(activeProjectId, updatedData)} />`;
    }

    return html`
        <div class="projects-container">
            <div class="page-header">
                <h2><i class="fa-solid fa-folder-tree"></i> My ${pageNames.Projects}</h2>
                <button onClick=${() => setIsCreating(!isCreating)}>
                    <i class="fa-solid ${isCreating ? 'fa-times' : 'fa-plus'}"></i> ${isCreating ? 'Cancel' : 'New Project'}
                </button>
            </div>
            ${isCreating && html`
                <form class="create-project-form admin-panel-card" onSubmit=${handleCreateProject}>
                    <input type="text" placeholder="Project Name" value=${newProjectName} onInput=${e => setNewProjectName(e.target.value)} />
                    <textarea placeholder="Project Description (optional)" value=${newProjectDesc} onInput=${e => setNewProjectDesc(e.target.value)}></textarea>
                    <button type="submit">Create Project</button>
                </form>
            `}
            <div class="projects-grid">
                ${userProjects.length === 0 && !isCreating ? html`
                    <div class="placeholder-text full-width-placeholder">
                        <i class="fa-solid fa-folder-open"></i>
                        <h2>Your Creative Hub Awaits</h2>
                        <p>Projects are where you organize your generated assets, tasks, and ideas. Let's create your first one!</p>
                        <button onClick=${() => setIsCreating(true)}>
                            <i class="fa-solid fa-plus"></i> Create New Project
                        </button>
                    </div>
                ` : userProjects.map(project => html`
                    <div class="project-card" onClick=${() => setActiveProjectId(project.id)}>
                        <div class="project-card-header">
                            <h3>${project.name}</h3>
                            <div class="project-card-actions">
                                <button class="action-btn" onClick=${(e) => openEditModal(project, e)} title="Edit Project" aria-label="Edit Project"><i class="fa-solid fa-pencil"></i></button>
                                <button class="action-btn delete" onClick=${(e) => deleteProject(project.id, e)} title="Delete Project" aria-label="Delete Project"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                        <p class="project-desc">${project.description || 'No description provided.'}</p>
                        <div class="project-meta">
                            <span><i class="fa-solid fa-calendar-days"></i> Created: ${project.createdAt}</span>
                            <span><i class="fa-solid fa-file-alt"></i> ${project.items.length} items</span>
                        </div>
                    </div>
                `)}
            </div>
        </div>
    `;
};

const ProjectDetailView = ({ project, setProject }) => {
    const { setActiveProjectId, currentUser, logActivity, openModal, closeModal } = useContext(AppContext)!;
    const [projectTab, setProjectTab] = useState('assets');
    
    const handleNoteChange = (e) => setProject({ ...project, notes: e.target.value });
    
    const handleAddTask = (e) => {
        e.preventDefault();
        const content = e.target.elements.taskName.value;
        if (content.trim()) {
            const newTask: Task = { id: generateUniqueId(), content, status: 'todo' };
            setProject({ ...project, tasks: [...project.tasks, newTask] });
            logActivity('Added Task to Project', `${content} in ${project.name}`);
            e.target.reset();
        }
    };
    const updateTaskStatus = (taskId: string, status: Task['status']) => {
        const updatedTasks = project.tasks.map(t => t.id === taskId ? { ...t, status } : t);
        setProject({ ...project, tasks: updatedTasks });
        const taskContent = project.tasks.find(t => t.id === taskId)?.content || '';
        logActivity('Updated Task Status', `${taskContent} to ${status} in ${project.name}`);
    };
    
    const handleAssetClick = (item: GalleryItem) => {
        openModal(html`<${MediaPreviewModal} item=${item} closeModal=${closeModal} />`);
    };

    return html`
        <div class="project-detail-container">
            <div class="project-detail-header">
                <button class="secondary-btn" onClick=${() => setActiveProjectId(null)}><i class="fa-solid fa-arrow-left"></i> Back to Projects</button>
                <h2>${project.name}</h2>
                <p>${project.description}</p>
            </div>
            <div class="tool-selector">
                <button class="${projectTab === 'assets' ? 'active' : ''}" onClick=${() => setProjectTab('assets')}><i class="fa-solid fa-archive"></i> Assets (${project.items.length})</button>
                <button class="${projectTab === 'tasks' ? 'active' : ''}" onClick=${() => setProjectTab('tasks')}><i class="fa-solid fa-tasks"></i> Tasks ${!currentUser!.isPremium ? html`<span class="premium-badge-ui">PRO</span>` : `(${project.tasks.length})`}</button>
                <button class="${projectTab === 'notes' ? 'active' : ''}" onClick=${() => setProjectTab('notes')}><i class="fa-solid fa-sticky-note"></i> Notes</button>
            </div>
            <div class="admin-panel-card">
                ${projectTab === 'assets' && html`
                    <div class="project-assets-grid">
                        ${project.items.map(item => html`
                            <div class="project-asset-card" onClick=${() => handleAssetClick(item)}>
                                ${item.type === 'image' && html`<img src=${item.url} class="asset-thumbnail" />`}
                                ${item.type === 'video' && html`<video src=${item.url} class="asset-thumbnail" muted />`}
                                <p>${item.prompt.substring(0, 40)}...</p>
                            </div>
                        `)}
                        ${project.items.length === 0 && html`<p>No assets yet. Add some from the Generator or Studio!</p>`}
                    </div>
                `}
                ${projectTab === 'tasks' && (currentUser!.isPremium ? html`
                    <div class="project-kanban-board">
                        ${['todo', 'inprogress', 'done'].map(status => html`
                            <div class="kanban-column ${status}">
                                <h4>${status.charAt(0).toUpperCase() + status.slice(1)}</h4>
                                ${project.tasks.filter(t => t.status === status).map(task => html`
                                    <div class="kanban-task">
                                        <p>${task.content}</p>
                                        <select value=${task.status} onChange=${e => updateTaskStatus(task.id, e.target.value)}>
                                            <option value="todo">To Do</option>
                                            <option value="inprogress">In Progress</option>
                                            <option value="done">Done</option>
                                        </select>
                                    </div>
                                `)}
                                ${status === 'todo' && html`
                                    <form class="add-task-form" onSubmit=${handleAddTask}>
                                        <input type="text" name="taskName" placeholder="New task..." />
                                        <button type="submit" style=${{padding: '0.5rem', minWidth: '40px'}} aria-label="Add new task"><i class="fa-solid fa-plus"></i></button>
                                    </form>
                                `}
                            </div>
                        `)}
                    </div>
                ` : html`
                    <div class="premium-lock-overlay">
                        <h3><i class="fa-solid fa-star"></i> Task Board is a Premium Feature</h3>
                        <p>Upgrade to organize your projects with a Kanban board.</p>
                        <button onClick=${upgradeToPro}>Upgrade Now</button>
                    </div>
                `)}
                ${projectTab === 'notes' && html`
                    <textarea rows="15" onInput=${handleNoteChange} .value=${project.notes} placeholder="Jot down your project notes here..."></textarea>
                `}
            </div>
        </div>
    `;
};

const StudioView = () => {
    const { studioDocuments, setStudioDocuments, activeStudioDocumentId, setActiveStudioDocumentId, currentUser, showToast, openModal, closeModal, logActivity } = useContext(AppContext)!;
    const [isLoading, setIsLoading] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    
    const userDocuments = useMemo(() => studioDocuments.filter(d => d.userId === currentUser!.id), [studioDocuments, currentUser!.id]);
    const activeDocument = useMemo(() => userDocuments.find(d => d.id === activeStudioDocumentId), [userDocuments, activeStudioDocumentId]);
    
    useEffect(() => {
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            if(isFocusMode) appContainer.classList.add('focus-mode');
            else appContainer.classList.remove('focus-mode');
            return () => appContainer.classList.remove('focus-mode');
        }
    }, [isFocusMode]);

    const handleNewDocument = () => {
        if (!currentUser!.isPremium && userDocuments.length >= 3) {
            showToast('Free users can create up to 3 documents. Please upgrade.', 'error');
            upgradeToPro();
            return;
        }
        const newDoc: StudioDocument = {
            id: generateUniqueId(),
            title: 'Untitled Document',
            content: '',
            wordCount: 0,
            charCount: 0,
            lastModified: Date.now(),
            userId: currentUser!.id,
            versionHistory: [],
        };
        setStudioDocuments([newDoc, ...studioDocuments]);
        setActiveStudioDocumentId(newDoc.id);
        logActivity('Created Document', newDoc.title);
    };
    
    const updateDocument = (id: string, updates: Partial<StudioDocument>, saveVersion = false) => {
        setStudioDocuments(docs => docs.map(doc => {
            if (doc.id === id) {
                const newHistory = [...doc.versionHistory];
                if (saveVersion) {
                    newHistory.unshift({ content: doc.content, date: doc.lastModified });
                    if (!currentUser!.isPremium && newHistory.length > 5) {
                        newHistory.pop();
                    }
                }
                return { ...doc, ...updates, lastModified: Date.now(), versionHistory: newHistory };
            }
            return doc;
        }));
    };

    const handleContentChange = (e) => {
        if (!activeDocument) return;
        const content = e.target.value;
        const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
        updateDocument(activeDocument.id, { content, wordCount, charCount: content.length });
    };

    const handleTitleChange = (e) => {
        if (!activeDocument) return;
        updateDocument(activeDocument.id, { title: e.target.value });
    };
    
    const handleDeleteDocument = (id: string, e: Event) => {
        e.stopPropagation();
        if (confirm('Delete this document?')) {
            const docTitle = studioDocuments.find(d => d.id === id)?.title;
            logActivity('Deleted Document', docTitle);
            setStudioDocuments(docs => docs.filter(d => d.id !== id));
            if (activeStudioDocumentId === id) {
                 const remainingUserDocs = userDocuments.filter(d => d.id !== id);
                 setActiveStudioDocumentId(remainingUserDocs.length > 0 ? remainingUserDocs[0].id : null);
            }
        }
    };

    const performAIAction = async (action, promptText, premiumOnly = false) => {
        if (!activeDocument) return;
        if (premiumOnly && !currentUser!.isPremium) {
            showToast('This is a premium feature.', 'error');
            upgradeToPro();
            return;
        }
        setIsLoading(true);
        try {
            updateDocument(activeDocument.id, {}, true); // Save current state before AI change
            const textToProcess = activeDocument.content;
            const prompt = `${promptText}: \n\n"${textToProcess}"`;
            const response = await callApi('generateContent', 'gemini-2.5-flash', { contents: prompt });
            const newContent = action === 'Continue Writing' ? activeDocument.content + '\n' + response.text : response.text;
            updateDocument(activeDocument.id, { content: newContent });
            logActivity(`Used Studio AI: ${action}`, activeDocument.title);
            showToast(`${action} completed!`, 'success');
        } catch (error) {
            console.error('AI Action Error:', error);
            showToast('AI action failed.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const exportDoc = (format: 'md' | 'txt') => {
        if(!activeDocument) return;
        const blob = new Blob([activeDocument.content], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeDocument.title}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        logActivity(`Exported Document as .${format}`, activeDocument.title);
    };

    const openVersionHistory = () => {
        if (!activeDocument) return;
        openModal(html`
            <div class="version-history-modal">
                <h2>Version History for "${activeDocument.title}"</h2>
                <div class="version-list">
                    ${activeDocument.versionHistory.map(v => html`
                        <div class="version-item">
                            <span>${new Date(v.date).toLocaleString()}</span>
                            <button onClick=${() => {
                                updateDocument(activeDocument.id, { content: v.content }, true);
                                closeModal();
                                logActivity('Restored Document Version', activeDocument.title);
                                showToast('Version restored!', 'success');
                            }}>Restore</button>
                        </div>
                    `)}
                    ${activeDocument.versionHistory.length === 0 && html`<p>No versions saved yet.</p>`}
                </div>
                ${!currentUser!.isPremium && html`<p style=${{marginTop: '1rem', fontSize: '0.9rem'}}>Standard users are limited to 5 saves.</p>`}
            </div>
        `, 'version-history-modal');
    };

    return html`
        <div class="studio-container">
            <div class="studio-sidebar">
                <button class="new-doc-btn" onClick=${handleNewDocument}><i class="fa-solid fa-plus"></i> New Document</button>
                 ${!currentUser!.isPremium && html`<p class="sidebar-usage-notice">Document Limit: ${userDocuments.length}/3</p>`}
                <div class="document-list">
                    ${userDocuments.length === 0 ? html`
                        <div class="placeholder-text-mini"><p>Your documents will appear here.</p></div>
                    ` : userDocuments.sort((a,b) => b.lastModified - a.lastModified).map(doc => html`
                        <div class="document-item ${doc.id === activeStudioDocumentId ? 'active' : ''}" onClick=${() => setActiveStudioDocumentId(doc.id)}>
                            <div class="doc-item-content">
                                <p class="doc-title">${doc.title}</p>
                                <p class="doc-preview">${doc.content.substring(0, 30)}...</p>
                            </div>
                            <button class="action-btn delete doc-delete-btn" aria-label="Delete document" onClick=${(e) => handleDeleteDocument(doc.id, e)}><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `)}
                </div>
            </div>
            <div class="studio-main">
                ${activeDocument ? html`
                    <div class="document-editor">
                        <div class="editor-header">
                            <input type="text" class="doc-title-input" value=${activeDocument.title} onInput=${handleTitleChange} />
                            <div>
                                <button class="secondary-btn" onClick=${() => setIsFocusMode(!isFocusMode)} title=${isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"} aria-label=${isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}><i class="fa-solid ${isFocusMode ? 'fa-compress' : 'fa-expand'}"></i></button>
                                <button class="secondary-btn" onClick=${(e) => handleDeleteDocument(activeDocument.id, e)} title="Delete Document" aria-label="Delete Document"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                        <div class="ai-controls-toolbar">
                            <button disabled=${isLoading} onClick=${() => performAIAction('Summarize', 'Summarize the following text')}>Summarize</button>
                            <button disabled=${isLoading} onClick=${() => performAIAction('Improve Writing', 'Improve the writing of the following text')}>Improve</button>
                            <button disabled=${isLoading} onClick=${() => performAIAction('Fix Grammar', 'Fix the spelling and grammar of the following text')}>Fix Grammar</button>
                            <button disabled=${isLoading || !currentUser!.isPremium} onClick=${() => performAIAction('Continue Writing', 'Continue writing the following text', true)}>Continue Writing ${!currentUser!.isPremium && html`<span class="premium-badge-ui">PRO</span>`}</button>
                            <button disabled=${isLoading} onClick=${() => exportDoc('md')}>Export .md</button>
                            <button disabled=${isLoading} onClick=${openVersionHistory}>History</button>
                        </div>
                        <textarea 
                            class="editor-textarea" 
                            value=${activeDocument.content} 
                            onInput=${handleContentChange}
                            onBlur=${() => updateDocument(activeDocument.id, {}, true)}
                            placeholder="Start writing..."
                        ></textarea>
                        ${isLoading && html`<div style=${{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><${Loader} text="AI is thinking..." /></div>`}
                        <div class="editor-footer">
                            <div class="doc-stats">
                                Word Count: ${activeDocument.wordCount} | Character Count: ${activeDocument.charCount}
                            </div>
                            <div class="save-status">
                                <i class="fa-solid fa-check"></i> Last saved: ${new Date(activeDocument.lastModified).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ` : html`
                     <div class="placeholder-text">
                        <i class="fa-solid fa-file-alt"></i>
                        <h2>No document selected</h2>
                        <p>Create a new document or select one from the list to start writing.</p>
                    </div>
                `}
            </div>
        </div>
    `;
};

const CodeSandboxView = () => {
    const { currentUser, showToast, logActivity } = useContext(AppContext)!;
    const [htmlCode, setHtmlCode] = useState('<h1>Hello, Creative!</h1>\n<p>Your content here</p>');
    const [cssCode, setCssCode] = useState('body { \n  background: #282c34; \n  color: white; \n  font-family: sans-serif; \n  text-align: center; \n  padding-top: 50px;\n}');
    const [jsCode, setJsCode] = useState('console.log("Welcome to the Sandbox!");');
    const [srcDoc, setSrcDoc] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
                <html>
                    <body>${htmlCode}</body>
                    <style>${cssCode}</style>
                    <script>${jsCode}</script>
                </html>
            `);
        }, 300);
        return () => clearTimeout(timeout);
    }, [htmlCode, cssCode, jsCode]);

    const handleAskAI = async (e) => {
        e.preventDefault();
        if (!aiPrompt.trim()) {
            showToast('Please enter a prompt for the AI.', 'error');
            return;
        }
         if (!currentUser!.isPremium) {
            showToast('AI code generation is a premium feature.', 'error');
            upgradeToPro();
            return;
        }
        setIsLoading(true);
        try {
            const prompt = `
                You are an expert web developer. Generate the complete HTML, CSS, and JavaScript for the following request.
                Return the response as a single JSON object with three keys: "html", "css", and "js". Do not include any markdown formatting.

                Request: "${aiPrompt}"
            `;
            const payload = {
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'OBJECT',
                        properties: {
                            html: { type: 'STRING' },
                            css: { type: 'STRING' },
                            js: { type: 'STRING' },
                        },
                        required: ['html', 'css', 'js']
                    }
                }
            };
            const response = await callApi('generateContent', 'gemini-2.5-flash', payload);
            const result = JSON.parse(response.text);
            setHtmlCode(result.html || '');
            setCssCode(result.css || '');
            setJsCode(result.js || '');
            logActivity('Used Sandbox AI', aiPrompt);
            showToast('AI has generated your code!', 'success');
        } catch (error) {
            console.error('Sandbox AI Error:', error);
            showToast('AI failed to generate valid code.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadZip = () => {
        if (!currentUser!.isPremium) {
            showToast('Downloading as a ZIP is a premium feature.', 'error');
            upgradeToPro();
            return;
        }
        const zip = new JSZip();
        zip.file("index.html", `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n${htmlCode}\n  <script src="script.js"></script>\n</body>\n</html>`);
        zip.file("style.css", cssCode);
        zip.file("script.js", jsCode);
        zip.generateAsync({ type: "blob" }).then(content => {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = "code-sandbox-project.zip";
            a.click();
            URL.revokeObjectURL(url);
            logActivity('Downloaded Sandbox Project as ZIP');
        });
    };

    return html`
        <div class="sandbox-container">
            <div class="sandbox-controls admin-panel-card">
                 <form class="sandbox-ai-prompt" onSubmit=${handleAskAI}>
                    <input 
                        type="text" 
                        value=${aiPrompt} 
                        onInput=${e => setAiPrompt(e.target.value)}
                        placeholder="Describe what you want to build with AI... (e.g., a responsive card with a glowing border)"
                        disabled=${isLoading || !currentUser!.isPremium}
                    />
                    <button type="submit" disabled=${isLoading || !currentUser!.isPremium}>
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        ${isLoading ? 'Generating...' : 'Generate'}
                        ${!currentUser!.isPremium && html`<span class="premium-badge-ui">PRO</span>`}
                    </button>
                </form>
                <div style=${{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <p>Or edit the code manually below.</p>
                     <button onClick=${handleDownloadZip} disabled=${!currentUser!.isPremium} class="secondary-btn">
                        <i class="fa-solid fa-file-zipper"></i> Download ZIP
                        ${!currentUser!.isPremium && html`<span class="premium-badge-ui">PRO</span>`}
                    </button>
                </div>
            </div>
            <div class="sandbox-panels">
                <div class="sandbox-panel">
                    <div class="sandbox-panel-header"><i class="fa-brands fa-html5" style=${{color: '#e34c26'}}></i> HTML</div>
                    <textarea class="sandbox-editor" value=${htmlCode} onInput=${e => setHtmlCode(e.target.value)}></textarea>
                </div>
                 <div class="sandbox-panel">
                    <div class="sandbox-panel-header"><i class="fa-brands fa-css3-alt" style=${{color: '#264de4'}}></i> CSS</div>
                    <textarea class="sandbox-editor" value=${cssCode} onInput=${e => setCssCode(e.target.value)}></textarea>
                </div>
                 <div class="sandbox-panel">
                    <div class="sandbox-panel-header"><i class="fa-brands fa-js" style=${{color: '#f0db4f'}}></i> JS</div>
                    <textarea class="sandbox-editor" value=${jsCode} onInput=${e => setJsCode(e.target.value)}></textarea>
                </div>
            </div>
            <div class="sandbox-output">
                <iframe
                    srcDoc=${srcDoc}
                    title="output"
                    sandbox="allow-scripts allow-modals allow-forms"
                    frameBorder="0"
                    width="100%"
                    height="100%"
                />
            </div>
        </div>
    `;
};

const NovelWriterView = () => {
    const { currentUser, showToast, logActivity } = useContext(AppContext)!;
    const [title, setTitle] = useState('');
    const [numChapters, setNumChapters] = useState(3);
    const [generatedChapters, setGeneratedChapters] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentChapter, setCurrentChapter] = useState(0);

    const handleGenerate = async () => {
        if (!title.trim()) {
            showToast('Please enter a title for your novel.', 'error');
            return;
        }
        setIsLoading(true);
        setGeneratedChapters([]);
        setCurrentChapter(1);
        try {
            const allChapters = [];
            let chapterContext = `Novel Title: ${title}\n\n`;
            for (let i = 1; i <= numChapters; i++) {
                setCurrentChapter(i);
                const prompt = i === 1
                    ? `Write the first chapter of a novel titled "${title}". The chapter should be engaging and set the scene.`
                    : `Based on the previous content, write the next chapter (Chapter ${i}) of the novel titled "${title}". Ensure a logical continuation of the story. Previous context:\n\n${chapterContext.slice(-2000)}`; // Provide last 2000 chars as context

                const response = await callApi('generateContent', 'gemini-2.5-flash', { contents: prompt });
                const chapterContent = response.text;
                allChapters.push(chapterContent);
                chapterContext += `Chapter ${i}:\n${chapterContent}\n\n`;
                setGeneratedChapters([...allChapters]);
            }
            logActivity('Generated Novel', title);
            showToast('Novel generation complete!', 'success');
        } catch (error) {
            console.error('Novel Generation Error:', error);
            showToast('Failed to generate novel.', 'error');
        } finally {
            setIsLoading(false);
            setCurrentChapter(0);
        }
    };
    
    const exportToPDF = () => {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(title, 10, 20);
        
        doc.setFontSize(12);
        let y = 30;
        
        generatedChapters.forEach((chapter, index) => {
            if (y > 270) { // New page
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(14);
            doc.text(`Chapter ${index + 1}`, 10, y);
            y += 10;
            doc.setFontSize(12);
            
            const lines = doc.splitTextToSize(chapter, 180);
            lines.forEach(line => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 10, y);
                y += 7;
            });
            y += 10; // Space between chapters
        });

        doc.save(`${title.replace(/\s/g, '_')}.pdf`);
        logActivity('Exported Novel as PDF', title);
    };

    const exportToDocx = async () => {
        const paragraphs = [];
        paragraphs.push(new docx.Paragraph({
            children: [new docx.TextRun({ text: title, bold: true, size: 36 })],
            spacing: { after: 240 },
        }));

        generatedChapters.forEach((chapter, index) => {
            paragraphs.push(new docx.Paragraph({
                children: [new docx.TextRun({ text: `Chapter ${index + 1}`, bold: true, size: 28 })],
                spacing: { before: 240, after: 120 },
            }));
            chapter.split('\n').forEach(line => {
                paragraphs.push(new docx.Paragraph({
                    children: [new docx.TextRun(line)],
                }));
            });
        });
        
        const doc = new docx.Document({ sections: [{ children: paragraphs }] });

        const blob = await docx.Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s/g, '_')}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        logActivity('Exported Novel as DOCX', title);
    };

    return html`
        <div class="novel-writer-container">
            <div class="admin-panel-card">
                <h2><i class="fa-solid fa-book-open"></i> AI Novel Writer</h2>
                <p>Provide a title and the number of chapters, and let the AI craft a story for you.</p>
                <div class="prompt-form-main">
                    <input type="text" placeholder="Novel Title" value=${title} onInput=${e => setTitle(e.target.value)} disabled=${isLoading} />
                    <div class="num-questions-slider">
                        <label>Chapters:</label>
                        <input type="range" min="1" max="10" value=${numChapters} onInput=${e => setNumChapters(parseInt(e.target.value))} disabled=${isLoading} />
                        <span>${numChapters}</span>
                    </div>
                    <button onClick=${handleGenerate} disabled=${isLoading}>
                        ${isLoading ? `Generating Chapter ${currentChapter}...` : html`<i class="fa-solid fa-pen-nib"></i> Write Novel`}
                    </button>
                </div>
            </div>
            <div class="novel-output-area admin-panel-card">
                ${isLoading && !generatedChapters.length ? html`<${Loader} text=${`Generating Chapter ${currentChapter} of ${numChapters}...`} />` : ''}
                ${!isLoading && !generatedChapters.length ? html`
                    <div class="placeholder-text">
                        <i class="fa-solid fa-feather-pointed"></i>
                        <h2>Your Story Awaits</h2>
                        <p>Your generated novel will appear here, chapter by chapter.</p>
                    </div>
                ` : html`
                    <div class="novel-header">
                        <h2>${title}</h2>
                        <div class="novel-actions">
                            <button class="secondary-btn" onClick=${exportToPDF} disabled=${isLoading}><i class="fa-solid fa-file-pdf"></i> Export PDF</button>
                            <button class="secondary-btn" onClick=${exportToDocx} disabled=${isLoading}><i class="fa-solid fa-file-word"></i> Export DOCX</button>
                        </div>
                    </div>
                    <div class="novel-content">
                        ${generatedChapters.map((chapter, index) => html`
                            <div class="novel-chapter">
                                <h3>Chapter ${index + 1}</h3>
                                <div class="message-content" dangerouslySetInnerHTML=${{ __html: marked.parse(chapter) }}></div>
                            </div>
                        `)}
                        ${isLoading && html`<${Loader} text=${`Generating Chapter ${currentChapter} of ${numChapters}...`} />`}
                    </div>
                `}
            </div>
        </div>
    `;
};

const ChatView = () => {
    const { 
        chatSessions, setChatSessions, 
        activeChatSessionId, setActiveChatSessionId,
        currentUser, setCurrentUser,
        showToast, logActivity, setBlogPosts, setActiveTab
    } = useContext(AppContext)!;

    const [isLoading, setIsLoading] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("");
    const messagesEndRef = useRef(null);

    const userChatSessions = useMemo(() => chatSessions.filter(s => s.userId === currentUser!.id), [chatSessions, currentUser!.id]);
    const activeSession = useMemo(() => userChatSessions.find(s => s.id === activeChatSessionId), [userChatSessions, activeChatSessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeSession?.messages]);

    const createNewChat = () => {
        const newSession: ChatSession = {
            id: generateUniqueId(),
            name: `Chat on ${new Date().toLocaleDateString()}`,
            messages: [],
            persona: 'default',
            userId: currentUser!.id
        };
        setChatSessions(prev => [newSession, ...prev]);
        setActiveChatSessionId(newSession.id);
        logActivity('Started New Chat');
    };
    
    const handleSendMessage = async (e: Event) => {
        e.preventDefault();
        if (isLoading || !currentMessage.trim() || !activeSession) return;

        const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: currentMessage }] };
        const newMessages = [...activeSession.messages, newUserMessage];
        
        // Optimistically update UI
        setChatSessions(sessions => sessions.map(s => s.id === activeChatSessionId ? { ...s, messages: newMessages } : s));
        setCurrentMessage("");
        setIsLoading(true);
        
        try {
            const payload = { contents: newMessages };
            const stream = await callApi('generateContentStream', 'gemini-2.5-flash', payload);
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";

            // Add an empty model message to update as chunks arrive
            setChatSessions(sessions => sessions.map(s => {
                if (s.id === activeChatSessionId) {
                    return { ...s, messages: [...newMessages, { role: 'model', parts: [{ text: '' }] }] };
                }
                return s;
            }));

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                // The backend proxy sends raw JSON chunks from the stream
                const textChunk = decoder.decode(value);
                
                // HACK: The stream from the proxy might not be perfectly formed JSON objects on each chunk.
                // A more robust solution would use a proper streaming parser or NDJSON.
                // For now, we'll try to parse what we can.
                try {
                    const json = JSON.parse(textChunk);
                    fullResponse += json.text;
                } catch(e) {
                    // It's likely not a full JSON object yet, just append the raw text. This is a fallback.
                     fullResponse += textChunk;
                }
                
                // Update the last message (the model's response) with the new content
                setChatSessions(sessions => sessions.map(s => {
                    if (s.id === activeChatSessionId) {
                        const lastMessageIndex = s.messages.length - 1;
                        const updatedMessages = [...s.messages];
                        updatedMessages[lastMessageIndex] = { role: 'model', parts: [{ text: fullResponse }] };
                        return { ...s, messages: updatedMessages };
                    }
                    return s;
                }));
            }

            setCurrentUser(prev => ({ ...prev!, usage: { ...prev!.usage, chats: prev!.usage.chats + 1 } }));
            logActivity('Sent Chat Message');
        } catch (error) {
            console.error("Chat error:", error);
            showToast("The AI is having trouble responding. Please try again.", "error");
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I couldn't process that. Please try again." }], error: true };
            // Replace the optimistic message with an error
             setChatSessions(sessions => sessions.map(s => s.id === activeChatSessionId ? { ...s, messages: [...newMessages, errorMessage] } : s));
        } finally {
            setIsLoading(false);
        }
    };

    const createBlogPostFromChat = () => {
        if (!activeSession || activeSession.messages.length === 0) {
            showToast("No chat content to create a post from.", "error");
            return;
        }

        const title = `Blog Post from: ${activeSession.name}`;
        const content = activeSession.messages.map(msg => `**${msg.role === 'user' ? 'You' : 'AI'}:**\n\n${msg.parts[0].text}`).join('\n\n---\n\n');
        
        const newPost = {
            id: generateUniqueId(),
            title,
            content,
            authorName: currentUser!.name,
            authorAvatar: currentUser!.avatar,
            createdAt: new Date().toISOString(),
            tags: ['Chat', 'AI-Generated'],
            isPublished: false, // Draft by default
        };

        setBlogPosts(prev => [newPost, ...prev]);
        logActivity('Created Blog Post from Chat', activeSession.name);
        showToast("Blog post draft created!", "success");
        setActiveTab('Blog');
    };

    return html`
        <div class="chat-container-reimplemented">
            <div class="chat-sidebar">
                <button onClick=${createNewChat}><i class="fa-solid fa-plus"></i> New Chat</button>
                <div class="document-list">
                ${userChatSessions.length === 0 ? html`
                    <div class="placeholder-text-mini"><p>Your chats will appear here.</p></div>
                ` : userChatSessions.map(session => html`
                    <div class="document-item ${session.id === activeChatSessionId ? 'active' : ''}" onClick=${() => setActiveChatSessionId(session.id)}>
                        <p class="doc-title">${session.name}</p>
                    </div>
                `)}
                </div>
            </div>
            <div class="chat-main">
                ${activeSession ? html`
                    <div class="chat-main-header">
                        <h3>${activeSession.name}</h3>
                        <button class="secondary-btn" onClick=${createBlogPostFromChat}><i class="fa-solid fa-feather"></i> Create Blog Post</button>
                    </div>
                    <div class="messages">
                        ${activeSession.messages.map((msg, index) => html`
                            <div key=${index} class="message ${msg.role}">
                                <div class="message-content" dangerouslySetInnerHTML=${{ __html: marked.parse(msg.parts[0].text) }}></div>
                            </div>
                        `)}
                        ${isLoading && activeSession.messages[activeSession.messages.length-1].role === 'user' && html`
                            <div class="message model">
                                <div class="message-content"><${Loader} text="AI is thinking..." /></div>
                            </div>
                        `}
                        <div ref=${messagesEndRef}></div>
                    </div>
                    <form class="chat-input" onSubmit=${handleSendMessage}>
                        <textarea 
                            value=${currentMessage} 
                            onInput=${e => setCurrentMessage(e.target.value)}
                            placeholder="Type your message..."
                            rows="1"
                        ></textarea>
                        <button type="submit" disabled=${isLoading} aria-label="Send message"><i class="fa-solid fa-paper-plane"></i></button>
                    </form>
                ` : html`
                    <div class="placeholder-text">
                        <i class="fa-solid fa-comments"></i>
                        <h2>Select or start a new chat</h2>
                        <p>Your conversations will be stored here.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

const GeneratorView = () => {
    const { currentUser, setCurrentUser, showToast, logActivity, setGalleryItems, projects, setProjects, openModal, closeModal } = useContext(AppContext)!;
    const [genType, setGenType] = useState('image');
    const [prompt, setPrompt] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            showToast('Please enter a prompt.', 'error');
            return;
        }
        if (!currentUser.isPremium && currentUser.usage.generations >= 100) {
            showToast('You have reached your monthly generation limit.', 'error');
            upgradeToPro();
            return;
        }
        if (genType === 'video' && !currentUser.isPremium) {
            showToast('Video generation is a premium feature.', 'error');
            upgradeToPro();
            return;
        }
        
        setIsLoading(true);
        setResults([]);
        
        try {
            if (genType === 'image') {
                setLoadingMessage('Generating your image...');
                const payload = {
                    prompt: prompt,
                    config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
                };
                const response = await callApi('generateImages', 'imagen-3.0-generate-002', payload);
                const imageUrl = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
                setResults([{ type: 'image', url: imageUrl, prompt }]);
                showToast('Image generated!', 'success');
            } else if (genType === 'video') {
                setLoadingMessage('Initializing video generation... This may take a few minutes.');
                const payload = {
                    prompt: prompt,
                    config: { numberOfVideos: 1 }
                };
                let operation = await callApi('generateVideos', 'veo-2.0-generate-001', payload);

                let waitTime = 0;
                const reassuringMessages = [
                    "The AI is warming up its creative circuits.",
                    "Rendering pixels and painting with light...",
                    "Composing the perfect sequence, just for you.",
                    "This is taking a bit longer than usual, but good things come to those who wait!",
                    "Almost there, adding the final touches..."
                ];

                while (!operation.done) {
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    waitTime += 10;
                    setLoadingMessage(reassuringMessages[Math.floor(waitTime / 30) % reassuringMessages.length] + ` (${waitTime}s)`);
                    operation = await callApi('getVideosOperation', 'veo-2.0-generate-001', { operation });
                }

                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                if(downloadLink) {
                    setLoadingMessage('Fetching your video...');
                    const blob = await callApi('fetchVideo', 'veo-2.0-generate-001', { downloadLink });
                    const videoUrl = URL.createObjectURL(blob);
                    setResults([{ type: 'video', url: videoUrl, prompt }]);
                    showToast('Video generated!', 'success');
                } else {
                     throw new Error('Video generation failed to return a valid link.');
                }
            }
            logActivity(`Generated ${genType}`, prompt);
            setCurrentUser(prev => ({...prev, usage: {...prev.usage, generations: prev.usage.generations + 1}}));
        } catch (error) {
            console.error('Generation Error:', error);
            showToast(`Failed to generate ${genType}. Please try again.`, 'error');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleDownload = (item) => {
        const link = document.createElement('a');
        link.href = item.url;
        const fileExtension = item.type === 'image' ? 'jpeg' : 'mp4';
        link.download = `${item.prompt.slice(0, 20).replace(/\s/g, '_')}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        logActivity(`Downloaded generated ${item.type}`);
    };

    const handlePreview = (item) => {
        openModal(html`<${MediaPreviewModal} item=${item} closeModal=${closeModal} />`, 'media-preview');
    };

    const handleAddToGallery = (item) => {
        const onSave = (projectId) => {
            const newItem = {
                id: generateUniqueId(),
                type: item.type,
                url: item.url,
                prompt: item.prompt,
                likes: 0,
                user: currentUser.name,
                userId: currentUser.id,
            };
            setGalleryItems(prev => [newItem, ...prev]);

            if (projectId) {
                setProjects(projs => projs.map(p => {
                    if (p.id === projectId) {
                        return { ...p, items: [newItem, ...p.items] };
                    }
                    return p;
                }));
                 showToast('Added to gallery and project!', 'success');
            } else {
                 showToast('Added to public gallery!', 'success');
            }
            logActivity(`Added generated ${item.type} to gallery`);
            setResults([]);
        };
        openModal(html`<${AddToProjectModal} item=${item} onSave=${onSave} closeModal=${closeModal} />`, 'add-to-project-modal');
    };

    return html`
        <div class="generator-container">
            <div class="page-header">
                <h2><i class="fa-solid fa-wand-magic-sparkles"></i> AI Media Generator</h2>
            </div>
            <div class="generator-controls admin-panel-card">
                <div class="tool-selector">
                    <button class="${genType === 'image' ? 'active' : ''}" onClick=${() => setGenType('image')}><i class="fa-solid fa-image"></i> Image</button>
                    <button class="${genType === 'video' ? 'active' : ''}" onClick=${() => setGenType('video')}><i class="fa-solid fa-video"></i> Video ${!currentUser.isPremium && html`<span class="premium-badge-ui">PRO</span>`}</button>
                </div>
                <div class="prompt-form-main">
                    <textarea value=${prompt} onInput=${e => setPrompt(e.target.value)} placeholder="e.g., A cinematic shot of a raccoon detective in a neon-lit alley" rows="3"></textarea>
                    <button onClick=${handleGenerate} disabled=${isLoading}>
                        ${isLoading ? 'Generating...' : html`<i class="fa-solid fa-star"></i> Generate`}
                    </button>
                </div>
                <${UsageCounter} />
            </div>
            <div class="generator-results-area">
                ${isLoading && html`<${Loader} text=${loadingMessage || 'AI is creating...'} />`}
                ${!isLoading && results.length === 0 && html`
                    <div class="placeholder-text">
                        <i class="fa-solid fa-lightbulb"></i>
                        <h2>Your creations will appear here</h2>
                        <p>Describe what you want to see and let the AI bring it to life.</p>
                    </div>
                `}
                ${results.length > 0 && html`
                    <div class="generator-results-grid">
                        ${results.map(res => html`
                            <div class="generated-item-card">
                                ${res.type === 'image' ? html`<img src=${res.url} />` : html`<video src=${res.url} controls loop />`}
                                <p class="generated-item-prompt">${res.prompt}</p>
                                <div class="generated-item-actions">
                                    <button class="secondary-btn" onClick=${() => handlePreview(res)}><i class="fa-solid fa-eye"></i> Preview</button>
                                    <button class="secondary-btn" onClick=${() => handleDownload(res)}><i class="fa-solid fa-download"></i> Download</button>
                                    <button onClick=${() => handleAddToGallery(res)}><i class="fa-solid fa-images"></i> Add to Gallery</button>
                                </div>
                            </div>
                        `)}
                    </div>
                `}
            </div>
        </div>
    `;
};
const ToolkitView = () => {
    const { currentUser, showToast, logActivity, setCurrentUser } = useContext(AppContext)!;
    const [isLoading, setIsLoading] = useState(false);
    
    const ToolCard = ({ title, icon, description, premium, children }) => {
        if (premium && !currentUser.isPremium) {
            return html`
                <div class="tool-card premium-locked">
                    <div class="tool-card-header">
                        <i class=${`fa-solid ${icon}`}></i>
                        <h3>${title} <span class="premium-badge-ui">PRO</span></h3>
                    </div>
                    <p>${description}</p>
                    <div class="premium-lock-overlay-small">
                        <button onClick=${upgradeToPro}>Upgrade to Unlock</button>
                    </div>
                </div>
            `;
        }
        return html`
            <div class="tool-card">
                <div class="tool-card-header">
                    <i class=${`fa-solid ${icon}`}></i>
                    <h3>${title}</h3>
                </div>
                <p>${description}</p>
                <div class="tool-card-body">
                    ${children}
                </div>
            </div>
        `;
    };
    
    const ColorPaletteGenerator = () => {
        const [prompt, setPrompt] = useState('cyberpunk city night');
        const [colors, setColors] = useState(['#0B0C10', '#1F2833', '#C5C6C7', '#66FCF1', '#45A29E']);

        const handleGenerate = async () => {
            setIsLoading(true);
            try {
                 const payload = {
                    contents: `Generate a 5-color palette based on this theme: "${prompt}". Return as a JSON array of hex codes.`,
                    config: { responseMimeType: 'application/json', responseSchema: { type: 'ARRAY', items: { type: 'STRING' } } }
                };
                const response = await callApi('generateContent', 'gemini-2.5-flash', payload);
                const parsedColors = JSON.parse(response.text);
                setColors(parsedColors);
                logActivity('Used Toolkit: Color Palette', prompt);
                setCurrentUser(prev => ({...prev, usage: {...prev.usage, toolkit: prev.usage.toolkit + 1}}));
            } catch (e) {
                showToast('Failed to generate colors.', 'error');
            } finally { setIsLoading(false); }
        };

        const handleCopy = (color) => {
            copyToClipboard(color);
            showToast(`Copied ${color} to clipboard!`, 'success');
        };

        return html`
            <div class="toolkit-form">
                <input type="text" value=${prompt} onInput=${e => setPrompt(e.target.value)} />
                <button onClick=${handleGenerate} disabled=${isLoading}>Generate</button>
            </div>
            <div class="color-palette-output">
                ${colors.map(color => html`
                    <div class="color-swatch" style=${{backgroundColor: color}} onClick=${() => handleCopy(color)}>
                        <span>${color}</span>
                    </div>
                `)}
            </div>
        `;
    };

    const CSSGradientGenerator = () => {
        const [prompt, setPrompt] = useState('dramatic sunset');
        const [gradient, setGradient] = useState('linear-gradient(to right, #ff7e5f, #feb47b)');

        const handleGenerate = async () => {
            setIsLoading(true);
            try {
                const payload = { contents: `Generate a single CSS linear-gradient string for this theme: "${prompt}". Only return the "linear-gradient(...)" part.` };
                const response = await callApi('generateContent', 'gemini-2.5-flash', payload);
                setGradient(response.text);
                logActivity('Used Toolkit: CSS Gradient', prompt);
                setCurrentUser(prev => ({...prev, usage: {...prev.usage, toolkit: prev.usage.toolkit + 1}}));
            } catch (e) { showToast('Failed to generate gradient.', 'error'); } 
            finally { setIsLoading(false); }
        };
        
        return html`
            <div class="toolkit-form">
                <input type="text" value=${prompt} onInput=${e => setPrompt(e.target.value)} />
                <button onClick=${handleGenerate} disabled=${isLoading}>Generate</button>
            </div>
            <div class="gradient-output">
                <div class="gradient-preview" style=${{background: gradient}}></div>
                <div class="code-output" onClick=${() => {copyToClipboard(gradient); showToast('Copied CSS to clipboard!', 'success');}}>
                    <code>${gradient}</code>
                    <i class="fa-solid fa-copy"></i>
                </div>
            </div>
        `;
    };
    
    return html`
        <div class="toolkit-container">
            <div class="page-header">
                <h2><i class="fa-solid fa-toolbox"></i> AI Toolkit</h2>
            </div>
            <p>A collection of specialized AI-powered tools to accelerate your creative workflow.</p>
            <div class="toolkit-grid">
                <${ToolCard} title="Color Palette Generator" icon="fa-palette" description="Describe a theme or mood to generate a beautiful, matching color palette.">
                    <${ColorPaletteGenerator} />
                </${ToolCard}>
                 <${ToolCard} title="CSS Gradient Generator" icon="fa-swatchbook" description="Generate stunning CSS gradients from a text description. Perfect for backgrounds.">
                    <${CSSGradientGenerator} />
                </${ToolCard}>
            </div>
        </div>
    `;
};
const CSAssistantView = () => {
    const { currentUser, setCurrentUser, csHistory, setCsHistory, showToast, logActivity } = useContext(AppContext)!;
    const [isLoading, setIsLoading] = useState(false);
    const [tool, setTool] = useState('explain');
    const [inputCode, setInputCode] = useState('');
    const [extraPrompt, setExtraPrompt] = useState(''); // For translate tool
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [csHistory]);

    const handleSubmit = async () => {
        if (!inputCode.trim()) {
            showToast('Please enter some code.', 'error');
            return;
        }
        if (tool === 'translate' && !currentUser.isPremium) {
            showToast('Code translation is a premium feature.', 'error');
            upgradeToPro();
            return;
        }

        setIsLoading(true);
        const userMessage = { role: 'user', tool, inputCode, extraPrompt, id: generateUniqueId() };

        try {
            let prompt = '';
            switch (tool) {
                case 'explain': prompt = `Explain the following code snippet:\n\`\`\`\n${inputCode}\n\`\`\``; break;
                case 'optimize': prompt = `Optimize the following code for performance and readability:\n\`\`\`\n${inputCode}\n\`\`\``; break;
                case 'debug': prompt = `Find and fix any bugs in the following code. Explain the fix:\n\`\`\`\n${inputCode}\n\`\`\``; break;
                case 'translate': prompt = `Translate the following code to ${extraPrompt}:\n\`\`\`\n${inputCode}\n\`\`\``; break;
            }
            
            const response = await callApi('generateContent', 'gemini-2.5-flash', { contents: prompt });
            const modelMessage = { role: 'model', parts: response.text, id: generateUniqueId() };
            setCsHistory(prev => [...prev, userMessage, modelMessage]);
            logActivity('Used CS Assistant', tool);
            setCurrentUser(prev => ({...prev, usage: {...prev.usage, csAssistant: prev.usage.csAssistant + 1}}));

        } catch (error) {
            console.error('CS Assistant Error:', error);
            showToast('The AI failed to process the code.', 'error');
        } finally {
            setIsLoading(false);
            setInputCode('');
            setExtraPrompt('');
        }
    };
    
    return html`
        <div class="cs-assistant-container">
             <div class="page-header">
                <h2><i class="fa-solid fa-laptop-code"></i> CS Assistant</h2>
            </div>
            <div class="cs-assistant-main">
                <div class="cs-assistant-history">
                    ${csHistory.length === 0 ? html`
                        <div class="placeholder-text">
                            <i class="fa-solid fa-code"></i>
                            <h2>Your Coding Co-pilot</h2>
                            <p>Select a tool, paste your code, and let the AI assist you.</p>
                        </div>
                    ` : csHistory.map(msg => msg.role === 'user' ? html`
                        <div class="cs-message user-message">
                            <h4>${msg.tool.charAt(0).toUpperCase() + msg.tool.slice(1)} Request ${msg.tool === 'translate' ? `(to ${msg.extraPrompt})` : ''}</h4>
                            <pre><code>${msg.inputCode}</code></pre>
                        </div>
                    ` : html`
                        <div class="cs-message model-message">
                           <div class="message-content" dangerouslySetInnerHTML=${{ __html: marked.parse(msg.parts) }}></div>
                        </div>
                    `)}
                    <div ref=${messagesEndRef}></div>
                </div>
                 ${isLoading && html`<div class="cs-loader-overlay"><${Loader} text="AI is analyzing your code..." /></div>`}
                <div class="cs-assistant-input-area">
                    <div class="tool-selector">
                        <button class="${tool === 'explain' ? 'active' : ''}" onClick=${() => setTool('explain')}>Explain</button>
                        <button class="${tool === 'optimize' ? 'active' : ''}" onClick=${() => setTool('optimize')}>Optimize</button>
                        <button class="${tool === 'debug' ? 'active' : ''}" onClick=${() => setTool('debug')}>Debug</button>
                        <button class="${tool === 'translate' ? 'active' : ''}" onClick=${() => setTool('translate')}>Translate ${!currentUser.isPremium && html`<span class="premium-badge-ui">PRO</span>`}</button>
                    </div>
                    <textarea class="cs-code-input" value=${inputCode} onInput=${e => setInputCode(e.target.value)} placeholder="Paste your code here..."></textarea>
                    ${tool === 'translate' && html`
                        <input class="cs-extra-prompt" type="text" value=${extraPrompt} onInput=${e => setExtraPrompt(e.target.value)} placeholder="Enter target language (e.g., Python, JavaScript)" />
                    `}
                    <button class="cs-submit-btn" onClick=${handleSubmit} disabled=${isLoading}>Submit to AI</button>
                </div>
            </div>
        </div>
    `;
};
const LearningHubView = () => {
    const { currentUser, learningHubQuizzes, setLearningHubQuizzes, showToast, logActivity, setCurrentUser } = useContext(AppContext)!;
    const [isLoading, setIsLoading] = useState(false);
    const [quizState, setQuizState] = useState('idle'); // idle -> generating -> taking -> finished
    const [topic, setTopic] = useState('CSS Flexbox');
    const [numQuestions, setNumQuestions] = useState(5);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    
    const handleGenerateQuiz = async () => {
        if (!topic.trim()) { showToast('Please enter a topic.', 'error'); return; }
        setIsLoading(true); setQuizState('generating');
        try {
            const payload = {
                contents: `Generate a ${numQuestions}-question multiple-choice quiz about "${topic}". For each question, provide 4 options and indicate the correct answer.`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'OBJECT',
                        properties: {
                            topic: { type: 'STRING' },
                            questions: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        question: { type: 'STRING' },
                                        options: { type: 'ARRAY', items: { type: 'STRING' } },
                                        answer: { type: 'STRING' },
                                    },
                                    required: ['question', 'options', 'answer']
                                }
                            }
                        },
                        required: ['topic', 'questions']
                    }
                }
            };
            const response = await callApi('generateContent', 'gemini-2.5-flash', payload);
            const quizData = { ...JSON.parse(response.text), id: generateUniqueId() };
            setCurrentQuiz(quizData);
            setLearningHubQuizzes(prev => [...prev, quizData]);
            setQuizState('taking');
            setUserAnswers({});
            setCurrentQuestionIndex(0);
            logActivity('Generated Quiz', topic);
            setCurrentUser(prev => ({...prev, usage: {...prev.usage, quizzes: prev.usage.quizzes + 1}}));
        } catch (e) {
            showToast('Failed to generate quiz.', 'error');
            setQuizState('idle');
        } finally { setIsLoading(false); }
    };

    const handleAnswer = (question, answer) => {
        setUserAnswers(prev => ({ ...prev, [question]: answer }));
    };

    const handleSubmitQuiz = () => {
        setQuizState('finished');
    };

    const score = useMemo(() => {
        if (!currentQuiz) return 0;
        return currentQuiz.questions.reduce((total, q, index) => {
            return userAnswers[q.question] === q.answer ? total + 1 : total;
        }, 0);
    }, [quizState, userAnswers]);

    const renderContent = () => {
        if (quizState === 'taking' && currentQuiz) {
            const q = currentQuiz.questions[currentQuestionIndex];
            return html`
                <div class="quiz-card">
                    <p class="quiz-progress">Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}</p>
                    <h3>${q.question}</h3>
                    <div class="quiz-options">
                        ${q.options.map(opt => html`
                            <label class="quiz-option">
                                <input type="radio" name="question-${currentQuestionIndex}" value=${opt} checked=${userAnswers[q.question] === opt} onChange=${() => handleAnswer(q.question, opt)} />
                                <span>${opt}</span>
                            </label>
                        `)}
                    </div>
                    <div class="quiz-navigation">
                        <button class="secondary-btn" disabled=${currentQuestionIndex === 0} onClick=${() => setCurrentQuestionIndex(i => i - 1)}>Previous</button>
                        ${currentQuestionIndex < currentQuiz.questions.length - 1 ? html`
                            <button onClick=${() => setCurrentQuestionIndex(i => i + 1)}>Next</button>
                        ` : html`
                            <button onClick=${handleSubmitQuiz}>Finish Quiz</button>
                        `}
                    </div>
                </div>
            `;
        }
        if (quizState === 'finished' && currentQuiz) {
            return html`
                 <div class="quiz-card quiz-results">
                    <h2>Quiz Complete!</h2>
                    <p>You scored</p>
                    <div class="quiz-score">${score} / ${currentQuiz.questions.length}</div>
                    <button onClick=${() => { setQuizState('idle'); setCurrentQuiz(null); }}>Take Another Quiz</button>
                    <div class="quiz-review">
                         ${currentQuiz.questions.map(q => html`
                            <div class="review-item ${userAnswers[q.question] === q.answer ? 'correct' : 'incorrect'}">
                                <h4>${q.question}</h4>
                                <p>Your answer: ${userAnswers[q.question] || 'Not answered'}</p>
                                <p>Correct answer: ${q.answer}</p>
                            </div>
                        `)}
                    </div>
                </div>
            `;
        }
        return html`
            <div class="admin-panel-card">
                <h2>Generate a New Quiz</h2>
                <p>Enter any topic to test your knowledge.</p>
                <div class="prompt-form-main">
                    <input type="text" placeholder="Quiz Topic" value=${topic} onInput=${e => setTopic(e.target.value)} disabled=${isLoading} />
                    <div class="num-questions-slider">
                        <label>Questions:</label>
                        <input type="range" min="3" max="10" value=${numQuestions} onInput=${e => setNumQuestions(parseInt(e.target.value))} disabled=${isLoading} />
                        <span>${numQuestions}</span>
                    </div>
                    <button onClick=${handleGenerateQuiz} disabled=${isLoading}>
                        ${isLoading ? 'Generating...' : html`<i class="fa-solid fa-bolt"></i> Generate Quiz`}
                    </button>
                </div>
            </div>
            ${isLoading && quizState === 'generating' ? html`<${Loader} text="The AI is creating your quiz..." />` : ''}
        `;
    };

    return html`
        <div class="learning-hub-container">
             <div class="page-header">
                <h2><i class="fa-solid fa-graduation-cap"></i> Learning Hub</h2>
            </div>
            ${renderContent()}
        </div>
    `;
};
const GalleryView = () => {
    const { galleryItems, setGalleryItems, openModal, closeModal } = useContext(AppContext)!;

    const handleLike = (id: string, e: Event) => {
        e.stopPropagation();
        setGalleryItems(items => items.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item));
    };

    return html`
        <div class="gallery-container">
            <div class="page-header">
                <h2><i class="fa-solid fa-images"></i> Community Gallery</h2>
            </div>
            <div class="gallery-grid">
                ${galleryItems.length > 0 ? galleryItems.map(item => html`
                    <div class="gallery-item" onClick=${() => openModal(html`<${MediaPreviewModal} item=${item} closeModal=${closeModal} />`, 'media-preview')}>
                        ${item.type === 'image' && html`<img src=${item.url} alt=${item.prompt} />`}
                        ${item.type === 'video' && html`<video src=${item.url} muted loop />`}
                        <div class="gallery-item-overlay">
                            <p class="gallery-item-prompt">${item.prompt}</p>
                            <div class="gallery-item-info">
                                <span>by ${item.user}</span>
                                <button class="like-btn" onClick=${e => handleLike(item.id, e)}>
                                    <i class="fa-solid fa-heart"></i> ${item.likes}
                                </button>
                            </div>
                        </div>
                    </div>
                `) : html`
                    <div class="placeholder-text full-width-placeholder">
                        <p>The gallery is empty. Generate something and add it!</p>
                    </div>
                `}
            </div>
        </div>
    `;
}
const BlogView = () => {
    const { blogPosts, setBlogPosts, currentUser, pageNames, showToast, logActivity, openModal, closeModal } = useContext(AppContext)!;
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    
    const selectedPost = useMemo(() => blogPosts.find(p => p.id === selectedPostId), [blogPosts, selectedPostId]);
    
    const togglePublish = (id: string, e: Event) => {
        e.stopPropagation();
        const post = blogPosts.find(p => p.id === id);
        setBlogPosts(posts => posts.map(p => p.id === id ? {...p, isPublished: !p.isPublished} : p));
        logActivity(post?.isPublished ? 'Unpublished Post' : 'Published Post', post?.title);
        showToast(`Post ${post?.isPublished ? 'unpublished' : 'published'}.`, 'success');
    };

    const handleSavePost = (postData) => {
        const isNew = !blogPosts.some(p => p.id === postData.id);
        if (isNew) {
            setBlogPosts(prev => [postData, ...prev]);
            logActivity('Created Blog Post', postData.title);
            showToast('Blog post created!', 'success');
        } else {
            setBlogPosts(prev => prev.map(p => p.id === postData.id ? postData : p));
            logActivity('Updated Blog Post', postData.title);
            showToast('Blog post updated!', 'success');
        }
    };
    
    const openEditModal = (post, e) => {
        e.stopPropagation();
        openModal(html`<${BlogEditModal} post=${post} onSave=${handleSavePost} closeModal=${closeModal} />`, 'edit-modal');
    };

    const openNewPostModal = () => {
        openModal(html`<${BlogEditModal} post=${null} onSave=${handleSavePost} closeModal=${closeModal} />`, 'edit-modal');
    };

    if (selectedPost) {
        return html`
            <div class="blog-post-view">
                <button class="secondary-btn" onClick=${() => setSelectedPostId(null)}><i class="fa-solid fa-arrow-left"></i> Back to ${pageNames.Blog}</button>
                <h1>${selectedPost.title}</h1>
                <div class="blog-card-meta" style=${{padding: '1rem 0', border: 'none'}}>
                    <img src=${selectedPost.authorAvatar} alt=${selectedPost.authorName} class="profile-avatar" />
                    <div>
                        <strong>${selectedPost.authorName}</strong>
                        <p>${new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="blog-post-content" dangerouslySetInnerHTML=${{ __html: marked.parse(selectedPost.content) }}></div>
            </div>
        `;
    }

    return html`
        <div class="blog-container">
            <div class="page-header">
                <h2><i class="fa-solid fa-newspaper"></i> ${pageNames.Blog}</h2>
                 ${currentUser?.role === 'admin' && html`<button onClick=${openNewPostModal}><i class="fa-solid fa-plus"></i> New Post</button>`}
            </div>
            <div class="blog-grid">
                ${blogPosts.filter(p => p.isPublished || currentUser?.role === 'admin').map(post => html`
                    <div class="blog-card" onClick=${() => setSelectedPostId(post.id)}>
                        <div class="blog-card-content">
                            <h3>${post.title}</h3>
                            <p>${post.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
                        </div>
                        <div class="blog-card-meta">
                            <img src=${post.authorAvatar} alt=${post.authorName} class="profile-avatar" />
                            <div>
                                <strong>${post.authorName}</strong>
                                <p>${new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                            ${currentUser?.role === 'admin' && html`
                                <div class="blog-admin-actions">
                                    <button onClick=${e => openEditModal(post, e)} class="action-btn" title="Edit Post">
                                        <i class="fa-solid fa-pencil"></i>
                                    </button>
                                    <button onClick=${e => togglePublish(post.id, e)} class="action-btn" title=${post.isPublished ? 'Unpublish' : 'Publish'}>
                                        <i class="fa-solid ${post.isPublished ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                `)}
            </div>
        </div>
    `;
}
const ProfileView = () => {
    const { currentUser, setCurrentUser, showToast, logActivity, subscriptionPlans, setActiveTab } = useContext(AppContext)!;
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: currentUser!.name, bio: currentUser!.bio, avatar: currentUser!.avatar });

    const handleUpdate = (e) => {
        e.preventDefault();
        setCurrentUser(prev => ({ ...prev!, ...editForm }));
        logActivity('Updated Profile');
        showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleUpgrade = (planName: string) => {
        if (currentUser!.isPremium) {
            showToast("You are already on the best plan!", "success");
            return;
        }
        logActivity(`Clicked Upgrade to ${planName}`);
        upgradeToPro();
    };
    
    return html`
        <div class="profile-container">
             <div class="page-header">
                <h2><i class="fa-solid fa-user-circle"></i> My Profile</h2>
            </div>
            <div class="profile-grid">
                <div class="admin-panel-card profile-card">
                    <div class="profile-card-header">
                        <h3>Your Information</h3>
                        <button class="secondary-btn" onClick=${() => setIsEditing(!isEditing)}>
                            <i class="fa-solid ${isEditing ? 'fa-times' : 'fa-pencil'}"></i>
                            ${isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                    ${!isEditing ? html`
                        <div class="profile-display">
                            <img src=${currentUser!.avatar} alt="Your avatar" class="profile-avatar-large" />
                            <h3>${currentUser!.name}</h3>
                            <p class="profile-email">${currentUser!.email}</p>
                            <p class="profile-bio">${currentUser!.bio || 'No bio yet. Add one!'}</p>
                        </div>
                    ` : html`
                        <form class="profile-edit-form" onSubmit=${handleUpdate}>
                             <label for="name">Name</label>
                            <input type="text" name="name" id="name" value=${editForm.name} onInput=${handleInputChange} />
                             <label for="avatar">Avatar URL</label>
                            <input type="text" name="avatar" id="avatar" value=${editForm.avatar} onInput=${handleInputChange} />
                             <label for="bio">Bio</label>
                            <textarea name="bio" id="bio" rows="4" onInput=${handleInputChange}>${editForm.bio}</textarea>
                            <button type="submit">Save Changes</button>
                        </form>
                    `}
                </div>
                 <div class="admin-panel-card subscription-card">
                    <h3>Usage Statistics</h3>
                    <div class="usage-list" style=${{marginTop: '1.5rem'}}>
                        <div class="usage-item"><span>Generations</span><strong>${currentUser!.usage.generations} / ${currentUser!.isPremium ? '∞' : '100'}</strong></div>
                        <div class="usage-item"><span>Chats</span><strong>${currentUser!.usage.chats}</strong></div>
                        <div class="usage-item"><span>Projects</span><strong>${currentUser!.usage.projects} / ${currentUser!.isPremium ? '∞' : '5'}</strong></div>
                        <div class="usage-item"><span>Toolkit Uses</span><strong>${currentUser!.usage.toolkit}</strong></div>
                        <div class="usage-item"><span>CS Assistant</span><strong>${currentUser!.usage.csAssistant}</strong></div>
                        <div class="usage-item"><span>Quizzes Taken</span><strong>${currentUser!.usage.quizzes}</strong></div>
                    </div>
                </div>
                 <div class="admin-panel-card plans-card">
                    <h3>Subscription Plans</h3>
                    <p>Upgrade your plan to unlock premium features and unlimited usage.</p>
                    <div class="plans-grid">
                        ${subscriptionPlans.map(plan => html`
                            <div class="plan-item ${currentUser!.isPremium && plan.name === 'Premium' || !currentUser!.isPremium && plan.name === 'Standard' ? 'current' : ''}">
                                <h4>${plan.name}</h4>
                                <p class="plan-price">${plan.price}</p>
                                <ul class="plan-features">
                                    ${plan.features.map(feat => html`<li><i class="fa-solid fa-check"></i> ${feat}</li>`)}
                                </ul>
                                ${currentUser!.isPremium && plan.name === 'Premium' ? html`<div class="current-plan-badge">Current Plan</div>` : ''}
                                ${!currentUser!.isPremium && plan.name === 'Standard' ? html`<div class="current-plan-badge">Current Plan</div>` : ''}
                                ${!currentUser!.isPremium && plan.name === 'Premium' ? html`<button onClick=${() => handleUpgrade(plan.name)}>Upgrade Now</button>` : ''}
                            </div>
                        `)}
                    </div>
                </div>
            </div>
        </div>
    `;
}
const HelpView = () => {
    const { helpContent, pageNames } = useContext(AppContext)!;

    return html`
        <div class="help-container">
            <div class="page-header">
                <h2><i class="fa-solid fa-question-circle"></i> Help & Documentation</h2>
            </div>
            <p>Welcome to the CSS Creative Suite guide. Here you can find information about each major feature of the application.</p>
            <div class="faq-list" style=${{marginTop: '2rem'}}>
                 ${Object.entries(helpContent).map(([key, value]) => TABS_CONFIG[key] && html`
                    <details class="faq-item">
                        <summary>${pageNames[key] || key}</summary>
                        <p>${value}</p>
                    </details>
                 `)}
            </div>
        </div>
    `;
}
const AdminView = () => {
    const { 
        users, setUsers, 
        globalSettings, setGlobalSettings, 
        activityLog, pageNames, setPageNames, 
        showToast 
    } = useContext(AppContext)!;
    const [adminTab, setAdminTab] = useState('users');

    const handleUserStatusChange = (userId, status, days) => {
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === userId) {
                let suspensionEndDate = null;
                if (status === 'suspended' && days) {
                    const date = new Date();
                    date.setDate(date.getDate() + parseInt(days));
                    suspensionEndDate = date.toISOString();
                }
                return { ...u, status, suspensionEndDate };
            }
            return u;
        }));
        showToast('User status updated!', 'success');
    };

    const handleRoleChange = (userId, role) => {
        setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
        showToast('User role updated!', 'success');
    };
    
    const handlePremiumChange = (userId, isPremium) => {
        setUsers(users.map(u => u.id === userId ? { ...u, isPremium } : u));
        showToast('User premium status updated!', 'success');
    };

    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGlobalSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const renderAdminContent = () => {
        switch(adminTab) {
            case 'users':
                return html`
                    <h3>User Management</h3>
                    <div class="admin-table-wrapper">
                        <table class="admin-table">
                            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Premium</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${users.map(user => html`
                                    <tr>
                                        <td>${user.name}<br/><small>${user.email}</small></td>
                                        <td>
                                            <select value=${user.role} onChange=${e => handleRoleChange(user.id, e.target.value)} disabled=${user.email === ADMIN_EMAIL}>
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select value=${user.status} onChange=${e => handleUserStatusChange(user.id, e.target.value, 7)} disabled=${user.email === ADMIN_EMAIL}>
                                                <option value="active">Active</option>
                                                <option value="suspended">Suspended (7d)</option>
                                                <option value="banned">Banned</option>
                                            </select>
                                        </td>
                                        <td>
                                            <label class="switch">
                                                <input type="checkbox" checked=${user.isPremium} onChange=${e => handlePremiumChange(user.id, e.target.checked)} />
                                                <span class="slider"></span>
                                            </label>
                                        </td>
                                        <td><button class="secondary-btn" disabled>View Details</button></td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                    </div>
                `;
            case 'settings':
                return html`
                    <h3>Site Settings</h3>
                    <div class="admin-settings-grid">
                        <div class="admin-panel-card">
                            <h4>General</h4>
                            <label>Logo URL</label>
                            <input type="text" name="logoUrl" value=${globalSettings.logoUrl} onInput=${handleSettingsChange} />
                            <label>Announcement Banner</label>
                            <textarea name="announcement" rows="3" onInput=${handleSettingsChange}>${globalSettings.announcement}</textarea>
                            <label>Maintenance Mode</label>
                            <label class="switch"><input type="checkbox" name="maintenanceMode" checked=${globalSettings.maintenanceMode} onChange=${handleSettingsChange} /><span class="slider"></span></label>
                        </div>
                         <div class="admin-panel-card">
                            <h4>Page Names</h4>
                            ${Object.keys(pageNames).map(key => TABS_CONFIG[key] && html`
                                <label>${key}</label>
                                <input type="text" value=${pageNames[key]} onInput=${e => setPageNames(prev => ({...prev, [key]: e.target.value}))} />
                            `)}
                        </div>
                    </div>
                `;
            case 'logs':
                return html`
                    <h3>Activity Log (Last 200)</h3>
                    <div class="log-list">
                        ${activityLog.map(log => html`
                            <div class="log-entry">
                                <strong>${log.userName} (${log.userEmail})</strong>: ${log.action} - <small>${log.details}</small>
                                <br/>
                                <small>${new Date(log.timestamp).toLocaleString()}</small>
                            </div>
                        `)}
                    </div>
                `;
            default: return null;
        }
    };

    return html`
        <div class="admin-container">
            <div class="page-header">
                <h2><i class="fa-solid fa-user-shield"></i> Admin Panel</h2>
            </div>
            <div class="tool-selector admin-tabs">
                <button class="${adminTab === 'users' ? 'active' : ''}" onClick=${() => setAdminTab('users')}>Users</button>
                <button class="${adminTab === 'settings' ? 'active' : ''}" onClick=${() => setAdminTab('settings')}>Settings</button>
                <button class="${adminTab === 'logs' ? 'active' : ''}" onClick=${() => setAdminTab('logs')}>Activity Log</button>
            </div>
            <div class="admin-panel-card">
                ${renderAdminContent()}
            </div>
        </div>
    `;
}
const AboutView = () => {
    const { globalSettings, setGlobalSettings, currentUser, openModal, closeModal, showToast, logActivity } = useContext(AppContext)!;
    const { name, avatar, bio, email, github, linkedin, telegram } = globalSettings.aboutInfo;

    const handleSave = (newSettings) => {
        setGlobalSettings(newSettings);
        logActivity('Updated About Info');
        showToast('About information updated!', 'success');
    };

    return html`
        <div class="about-container">
            <div class="admin-panel-card">
                ${currentUser?.role === 'admin' && html`
                    <button class="edit-about-btn" onClick=${() => openModal(html`<${AboutEditModal} settings=${globalSettings} onSave=${handleSave} closeModal=${closeModal} />`, 'edit-modal')}>
                        <i class="fa-solid fa-pencil"></i> Edit Info
                    </button>
                `}
                <div class="about-header">
                    <img src=${avatar} alt="Creator's avatar" class="about-avatar" />
                    <div class="about-header-info">
                        <h1>${name}</h1>
                        <p class="about-bio">${bio}</p>
                    </div>
                </div>
                <div class="about-content">
                    <h2>About This Project</h2>
                    <p>
                        The CSS Creative Suite is a demonstration of a powerful, multi-modal AI application built with modern web technologies. It leverages the Google Gemini API to provide a seamless and interactive experience for creative tasks, from generating images and code to writing stories and learning new topics.
                    </p>
                    <p>
                        This project showcases session persistence, user management, and a suite of tools designed to inspire creativity and boost productivity for developers and designers alike.
                    </p>
                    
                    <h2>Connect with Me</h2>
                    <p>
                        I'm passionate about building innovative solutions with AI and web technologies. Feel free to reach out, connect, or check out my other work.
                    </p>
                     <div class="about-links">
                        <a href=${`mailto:${email}`} class="about-link"><i class="fa-solid fa-envelope"></i> Email</a>
                        <a href=${github} class="about-link" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github"></i> GitHub</a>
                        <a href=${linkedin} class="about-link" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>
                        <a href=${telegram} class="about-link" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-telegram"></i> Telegram</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}


const App = () => {
    const { 
        theme, toggleTheme,
        activeTab, setActiveTab,
        currentUser, logout, 
        globalSettings,
        pageNames,
        toast, 
        modal, closeModal, openModal
    } = useContext(AppContext)!;
    
    const [isNavOpen, setIsNavOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsNavOpen(false); // Close mobile nav on resize to desktop
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderView = () => {
        if (globalSettings.maintenanceMode && currentUser?.role !== 'admin') {
            return html`<${MaintenanceView} />`;
        }
        switch (activeTab) {
            case 'Home': return html`<${HomeView} />`;
            case 'Projects': return html`<${ProjectsView} />`;
            case 'Studio': return html`<${StudioView} />`;
            case 'CodeSandbox': return html`<${CodeSandboxView} />`;
            case 'NovelWriter': return html`<${NovelWriterView} />`;
            case 'Chat': return html`<${ChatView} />`;
            case 'Generator': return html`<${GeneratorView} />`;
            case 'Toolkit': return html`<${ToolkitView} />`;
            case 'CSAssistant': return html`<${CSAssistantView} />`;
            case 'LearningHub': return html`<${LearningHubView} />`;
            case 'Gallery': return html`<${GalleryView} />`;
            case 'Blog': return html`<${BlogView} />`;
            case 'Profile': return html`<${ProfileView} />`;
            case 'Help': return html`<${HelpView} />`;
            case 'Admin': 
                return currentUser?.role === 'admin' ? html`<${AdminView} />` : html`<h2>Access Denied</h2>`;
            case 'About': return html`<${AboutView} />`;
            default: return html`<${HomeView} />`;
        }
    };

    return html`
        <div class="app-container ${isNavOpen ? 'nav-open-body' : ''}">
             ${globalSettings.announcement && html`<div class="announcement-banner">${globalSettings.announcement}</div>`}
             <header class="header">
                 <div class="header-left">
                     <button class="nav-toggle" onClick=${() => setIsNavOpen(!isNavOpen)}><i class="fa-solid fa-bars"></i></button>
                     <h1>
                         <img src=${globalSettings.logoUrl} alt="Logo" class="header-logo"/>
                         <span class="header-title-text">CSS Creative Suite</span>
                     </h1>
                 </div>
                 <div class="header-controls">
                     <button class="secondary-btn search-btn" onClick=${() => openModal(html`<${GlobalSearchModal} closeModal=${closeModal} />`, 'global-search-modal')}>
                         <i class="fa-solid fa-search"></i>
                         <span class="search-btn-text">Search...</span>
                     </button>
                     <div class="user-profile">
                        <img src=${currentUser!.avatar} alt="User Avatar" class="profile-avatar"/>
                        <span class="user-profile-name">${currentUser!.name}</span>
                     </div>
                     <button class="theme-switcher secondary-btn" onClick=${toggleTheme} aria-label="Toggle theme">
                         <i class="fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
                     </button>
                      <button class="support-btn secondary-btn" onClick=${() => openModal(html`<${SupportModal} closeModal=${closeModal} />`, 'support-modal')}>
                         <i class="fa-solid fa-life-ring"></i>
                     </button>
                     <button class="logout-btn secondary-btn" onClick=${logout}><i class="fa-solid fa-sign-out-alt"></i></button>
                 </div>
            </header>
            <div class="app-body">
                <nav class="main-nav ${isNavOpen ? 'open' : ''}">
                     ${globalSettings.navOrder.map(tabKey => {
                        if (!TABS_CONFIG[tabKey]) return null;
                        if (tabKey === 'Admin' && currentUser?.role !== 'admin') return null;
                        return html`
                            <button 
                                class="tab ${activeTab === tabKey ? 'active' : ''}" 
                                onClick=${() => { setActiveTab(tabKey); setIsNavOpen(false); }}
                                title=${pageNames[tabKey] || tabKey}
                            >
                                <i class="fa-solid ${TABS_CONFIG[tabKey].brand ? 'fa-brands' : 'fa-solid'} ${'fa-' + TABS_CONFIG[tabKey].icon}"></i>
                                <span class="tab-text">${pageNames[tabKey] || tabKey}</span>
                            </button>
                        `})}
                </nav>
                <main class="content">
                    ${renderView()}
                </main>
            </div>
        </div>
        <${Toast} message=${toast.message} type=${toast.type} show=${toast.show} />
        <${Modal} isOpen=${modal.isOpen} closeModal=${closeModal} type=${modal.type}>${modal.content}</${Modal}>
    `;
};


// --- FINAL RENDER ---
const Root = () => html`
    <${AppProvider}>
        <${PasswordProtect}>
            <${App} />
        </${PasswordProtect}>
    </${AppProvider}>
`;

render(html`<${Root} />`, document.getElementById('root'));

export {};