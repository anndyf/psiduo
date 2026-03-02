"use client";

import { useState, useEffect } from "react";
import { 
    Send, Heart, MessageSquare, Trash2, 
    MoreHorizontal, User, ShieldCheck, BadgeCheck, X, RefreshCw, PenSquare, Info
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";

interface ComunidadeFeedProps {
    grupoId: string;
    token?: string;
    currentUserId?: string;
    isPsicologo?: boolean;
}

interface Post {
    id: string;
    conteudo: string;
    criadoEm: string;
    autor: {
        id: string;
        nome: string;
        tipo: "PARTICIPANTE" | "TERAPEUTA";
        foto?: string;
    };
    stats: {
        likes: number;
        comentarios: number;
    };
    userLiked: boolean;
    previewComentarios: Comentario[];
}

interface Comentario {
    id: string;
    conteudo: string;
    autorNome: string;
    autorTipo: "PARTICIPANTE" | "TERAPEUTA";
    criadoEm: string;
}

function timeAgo(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "agora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    return `${days} d`;
}

export default function ComunidadeFeed({ grupoId, token, currentUserId, isPsicologo }: ComunidadeFeedProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [novoPost, setNovoPost] = useState("");
    const [posting, setPosting] = useState(false);
    const [showPostForm, setShowPostForm] = useState(false);
    
    // Estado para controlar input de comentário aberto por post
    const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
    const [openComments, setOpenComments] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
        fetchFeed();
    }, [grupoId, token]);

    const fetchFeed = async () => {
        try {
            const headers: any = { "Pragma": "no-cache" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`/api/grupo/${grupoId}/comunidade`, { 
                cache: "no-store", 
                headers
            });
            const data = await res.json();
            console.log("Feed data:", data);
            if (data.feed) setPosts(data.feed);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar feed.");
        } finally {
            setLoading(false);
        }
    };

    const handlePostar = async () => {
        if (!novoPost.trim()) return;
        setPosting(true);

        try {
            const headers: any = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`/api/grupo/${grupoId}/comunidade`, {
                method: "POST",
                headers,
                body: JSON.stringify({ conteudo: novoPost })
            });
            
            const data = await res.json();
            
            if (data.success) {
                setNovoPost("");
                setShowPostForm(false);
                toast.success("Postagem publicada!");
                fetchFeed(); // Recarregar para garantir ordem e dados
            } else {
                toast.error(data.error || "Erro ao postar.");
            }
        } catch(e) {
            toast.error("Erro de conexão.");
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        // Optimistic update
        setPosts(current => current.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    userLiked: !p.userLiked,
                    stats: { 
                        ...p.stats, 
                        likes: p.userLiked ? p.stats.likes - 1 : p.stats.likes + 1 
                    }
                };
            }
            return p;
        }));

        try {
            const headers: any = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;
            
            await fetch(`/api/grupo/${grupoId}/comunidade/${postId}/curtir`, { 
                method: "POST",
                headers
            });
        } catch (error) {
            console.error(error); // Silent fail or revert
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("Tem certeza que deseja excluir esta postagem?")) return;

        setPosts(current => current.filter(p => p.id !== postId)); // Optimistic remove
        
        try {
            const headers: any = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`/api/grupo/${grupoId}/comunidade/${postId}`, { 
                method: "DELETE",
                headers 
            });
            if (!res.ok) toast.error("Erro ao excluir.");
        } catch(e) {
            toast.error("Erro ao excluir.");
        }
    };

    const handleComentar = async (postId: string) => {
        const texto = commentInputs[postId];
        if (!texto?.trim()) return;

        // Limpar input imediatamente para UX
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));

        try {
            const headers: any = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`/api/grupo/${grupoId}/comunidade/${postId}/comentarios`, {
                method: "POST",
                headers,
                body: JSON.stringify({ conteudo: texto })
            });
            const data = await res.json();

            if (data.success && data.comentario) {
                // Adicionar comentário à lista localmente
                setPosts(current => current.map(p => {
                    if (p.id === postId) {
                        return {
                            ...p,
                            stats: { ...p.stats, comentarios: p.stats.comentarios + 1 },
                            previewComentarios: [data.comentario, ...p.previewComentarios]
                        };
                    }
                    return p;
                }));
            }
        } catch(e) {
            toast.error("Erro ao comentar.");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Carregando comunidade...</div>;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 pb-4">


            {/* HEADER & ACTIONS */}
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={fetchFeed}
                    className="p-2 text-slate-400 hover:text-deep rounded-xl transition-all"
                    title="Atualizar Feed"
                >
                    <RefreshCw size={18} />
                </button>
                
                <button
                    onClick={() => setShowPostForm(true)}
                    className={`bg-deep text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-deep/10 flex items-center gap-2 ${showPostForm ? 'opacity-0 pointer-events-none absolute' : ''}`}
                >
                    <PenSquare size={16} />
                    Nova Postagem
                </button>
            </div>

            {/* FORMULÁRIO DE POSTAGEM (Overlay ou Expandable) */}
            {showPostForm && (
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100 mb-8 border border-slate-100 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Criar Postagem</h3>
                        <button onClick={() => setShowPostForm(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <textarea 
                        value={novoPost}
                        onChange={(e) => setNovoPost(e.target.value)}
                        placeholder="O que você gostaria de compartilhar com o grupo?"
                        className="w-full bg-slate-50 rounded-2xl p-4 h-32 resize-none border-2 border-transparent focus:border-slate-200 focus:bg-white transition-all outline-none placeholder:text-slate-400 text-slate-700 font-medium"
                        autoFocus
                        maxLength={500}
                    />
                    <div className="text-right text-[10px] text-slate-400 font-bold mt-1 px-1">
                        {novoPost.length}/500
                    </div>
                    
                    <div className="flex justify-end items-center mt-3 gap-3">
                        <button
                            onClick={() => setShowPostForm(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handlePostar}
                            disabled={!novoPost.trim() || posting}
                            className="bg-deep text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-deep/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {posting ? "Enviando..." : "Publicar"} <Send size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* LISTA DE POSTS */}
            <div className="space-y-6">
                {posts.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-400 font-bold">Nenhuma postagem ainda.</p>
                        <p className="text-slate-300 text-sm">Seja o primeiro a compartilhar!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            {/* HEADER POST */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <Avatar className="w-10 h-10 border border-slate-100">
                                        {post.autor.tipo === "TERAPEUTA" && <AvatarImage src={post.autor.foto} />}
                                        <AvatarFallback className="bg-slate-100 text-slate-400 font-bold flex items-center justify-center">
                                            {post.autor.tipo === "TERAPEUTA" ? (
                                                post.autor.nome[0].toUpperCase()
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800 text-sm">{post.autor.nome}</h3>
                                            {post.autor.tipo === "TERAPEUTA" && (
                                                <span className="bg-deep/10 text-deep text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <BadgeCheck size={10} /> PSI
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {new Date(post.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                {(post.autor.id === currentUserId || isPsicologo) && (
                                    <button 
                                        onClick={() => handleDelete(post.id)}
                                        className="text-slate-300 hover:text-red-500 p-2 transition-colors rounded-full hover:bg-red-50"
                                        title="Excluir postagem"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            {/* CONTEUDO */}
                            <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">
                                {post.conteudo}
                            </p>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-4 border-t border-slate-50 pt-4 mb-4">
                                <button 
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.userLiked ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Heart size={18} className={post.userLiked ? 'fill-current' : ''} />
                                    <span>{post.stats.likes}</span>
                                </button>
                                <button 
                                    onClick={() => setOpenComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <MessageSquare size={18} />
                                    <span>{post.stats.comentarios}</span>
                                </button>
                            </div>

                            {/* COMENTÁRIOS */}
                            {(openComments[post.id] || post.previewComentarios.length > 0) && (
                                <div className="bg-slate-50/50 rounded-xl p-4 space-y-4">
                                    {/* Lista de Comentários */}
                                    {/* Lista de Comentários - Timeline Style */}
                                    <div className="relative pl-4 border-l-2 border-slate-200 ml-2 space-y-4 mb-4">
                                        {post.previewComentarios.map(comentario => (
                                            <div key={comentario.id} className="relative">
                                                {/* Marcador na linha */}
                                                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-slate-50"></div>
                                                
                                                <div className="text-sm">
                                                    <span className="font-bold text-slate-800 mr-2">
                                                        {comentario.autorNome}
                                                        {comentario.autorTipo === "TERAPEUTA" && <BadgeCheck size={12} className="inline ml-1 text-deep" />}
                                                        <span className="text-[10px] text-slate-400 font-normal ml-2">
                                                            {timeAgo(comentario.criadoEm)}
                                                        </span>
                                                    </span>
                                                    <span className="text-slate-600 font-medium break-words">{comentario.conteudo}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Input de Comentário */}
                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            value={commentInputs[post.id] || ""}
                                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                            placeholder="Escreva um comentário..."
                                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-deep transition-colors"
                                            onKeyDown={(e) => e.key === 'Enter' && handleComentar(post.id)}
                                        />
                                        <button 
                                            onClick={() => handleComentar(post.id)}
                                            className="bg-deep text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* GUIA DA COMUNIDADE */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3 mt-4 flex gap-2">
                <div className="bg-slate-100 p-2 rounded-xl text-deep h-fit shrink-0">
                    <Info size={16} />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-deep mb-0.5">Como usar a Comunidade</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Este é um space seguro para compartilhar suas experiências, dúvidas e conquistas com o grupo. 
                        Sinta-se livre para interagir, apoiar os colegas e comentar nas postagens.
                        Lembre-se: o respeito e a empatia são fundamentais aqui.
                    </p>
                </div>
            </div>
        </div>
    );
}
