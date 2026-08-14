import { buttonVariants } from "@/components/ui/button";
function NotFound() {
  return (
    <div className='max-w-3xs text-center p-8 shadow mx-auto'>
      <h1>404</h1>
      <p className="my-4">Página não encontrada.</p>
      <a
        href="/"
        className={buttonVariants({ variant: "default", size: "default" })}
      >
        Voltar
      </a>
    </div>
  );
}

export default NotFound;
