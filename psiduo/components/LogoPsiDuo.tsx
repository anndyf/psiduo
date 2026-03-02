import Image from 'next/image';

interface LogoPsiDuoProps {
    variant?: 'dark' | 'light';
    className?: string;
    width?: number;
    height?: number;
}

/**
 * Componente de Logotipo oficial do PsiDuo.
 * @param variant 'dark' (azul para fundos claros) ou 'light' (branco para fundos escuros)
 */
export default function LogoPsiDuo({ 
    variant = 'dark', 
    className = "", 
    width = 160, 
    height = 80 
}: LogoPsiDuoProps) {
    const src = variant === 'light' ? '/logo-branco.png' : '/logo-azul.png';
    
    return (
        <div className={`flex items-center ${className}`}>
            <Image 
                src={src} 
                alt="PsiDuo" 
                width={width} 
                height={height} 
                className="object-contain w-auto h-auto"
                priority
            />
        </div>
    );
}
