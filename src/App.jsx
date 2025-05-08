import { Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import RelatorioVisual from "./components/RelatorioVisual";
import Despesas from "./components/Despesas";
import Receitas from "./components/Receitas";
import Mediuns from "./components/Mediuns";
import React from 'react';

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<RelatorioVisual />} />
        <Route path="/despesas" element={<Despesas />} />
        <Route path="/receitas" element={<Receitas />} />
        <Route path="/mediuns" element={<Mediuns />} />
      </Routes>
    </>
  );
}

export default App;