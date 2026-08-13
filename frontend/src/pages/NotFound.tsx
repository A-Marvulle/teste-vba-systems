import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Página não encontrada.</p>
      <Link to="/">Voltar</Link>
    </div>
  );
}

export default NotFound;
