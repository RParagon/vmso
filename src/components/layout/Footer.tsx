import React from 'react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-sidebar border-t border-sidebar-border py-4 px-6 text-center text-sidebar-foreground text-sm">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>
          © {currentYear} Direitos reservados VirtualMark
        </div>
        <div>
          Desenvolvido por Rafael Paragon
        </div>
      </div>
    </footer>
  );
};

export default Footer;