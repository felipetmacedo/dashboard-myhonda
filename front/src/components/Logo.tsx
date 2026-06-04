import logoMyHonda from "@/assets/logo-myhonda.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  alt?: string;
}

const sizeClasses = {
  sm: "h-6 w-auto",
  md: "h-8 w-auto",
  lg: "h-10 w-auto",
  xl: "h-12 w-auto",
};

export const Logo = ({ className = "", size = "md", alt = "MyHonda SFS" }: LogoProps) => {
  const sizeClass = sizeClasses[size];

  return (
    <img
      src={logoMyHonda}
      alt={alt} 
      className={`${sizeClass} ${className}`}
    />
  );
};
