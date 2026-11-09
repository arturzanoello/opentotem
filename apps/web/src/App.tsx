import { Link, Route, Routes } from 'react-router';
import { AdminPage } from './pages/AdminPage';
import { DisplayPage } from './pages/DisplayPage';
import { KdsPage } from './pages/KdsPage';

function Home() {
  const screens = [
    { to: '/admin', label: 'Admin', hint: 'Cardápio e vendas do dia' },
    { to: '/kds', label: 'Cozinha (KDS)', hint: 'Pedidos pagos em tempo real' },
    { to: '/display', label: 'Painel de senhas', hint: 'Para a TV do salão' },
  ];

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold">OpenTotem</h1>
      <p className="mt-2 text-neutral-600">Escolha a tela:</p>
      <ul className="mt-6 space-y-3">
        {screens.map((screen) => (
          <li key={screen.to}>
            <Link
              to={screen.to}
              className="block rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50"
            >
              <span className="font-semibold">{screen.label}</span>
              <span className="block text-sm text-neutral-500">{screen.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/kds" element={<KdsPage />} />
      <Route path="/display" element={<DisplayPage />} />
    </Routes>
  );
}
