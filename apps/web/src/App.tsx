import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ConfigPage } from './pages/ConfigPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { StatusPage } from './pages/StatusPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ConfigPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
