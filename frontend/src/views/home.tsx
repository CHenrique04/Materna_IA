import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* Cabeçalho do Dashboard */}
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, color: '#f8fafc' }}>
          Materna<span style={{ color: '#2dd4bf' }}>.IA</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginTop: '10px' }}>
          Painel de Controle - Sistema Distribuído de Triagem
        </p>
      </header>

      {/* Grid de Cartões (Módulos) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Cartão de Gestantes */}
        <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#2dd4bf', fontSize: '1.5rem' }}>👩‍⚕️ Gestantes</h2>
          <p style={{ color: '#cbd5e1', marginBottom: '30px', lineHeight: '1.5', flexGrow: 1 }}>
            Gerencie o cadastro, visualize os prontuários e monitore os dados das pacientes cadastradas no sistema.
          </p>
          <Link 
            to="/gestantes" 
            style={{ 
              display: 'block', 
              textAlign: 'center', 
              backgroundColor: '#2dd4bf', 
              color: '#0f172a', 
              padding: '12px 20px', 
              textDecoration: 'none', 
              borderRadius: '6px', 
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
          >
            Acessar Módulo
          </Link>
        </div>

        {/* Cartão de Alertas (Visual para o Professor ver potencial futuro) */}
        <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#fbbf24', fontSize: '1.5rem' }}>⚠️ Alertas (Em breve)</h2>
          <p style={{ color: '#cbd5e1', marginBottom: '30px', lineHeight: '1.5', flexGrow: 1 }}>
            Painel de recebimento das mensagens do WhatsApp e notificações de triagem de alto risco.
          </p>
          <button 
            disabled 
            style={{ 
              width: '100%',
              backgroundColor: '#475569', 
              color: '#94a3b8', 
              padding: '12px 20px', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            Módulo em Desenvolvimento
          </button>
        </div>

      </div>
    </div>
  );
}