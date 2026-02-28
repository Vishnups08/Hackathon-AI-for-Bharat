import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import SchemesList from './pages/SchemesList';
import SchemeDetail from './pages/SchemeDetail';
import CompareSchemes from './pages/CompareSchemes';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="chat" element={<Chat />} />
        <Route path="schemes" element={<SchemesList />} />
        <Route path="schemes/:id" element={<SchemeDetail />} />
        <Route path="compare" element={<CompareSchemes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
