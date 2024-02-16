// AppRouter.js
import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Home from '../views/Home'
import Receita from '../views/Receita'
import Despesa from '../views/Despesa'
import Compras from '../views/Compras'
import Faturas from '../views/Faturas'

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" exact element={<Home/>} />
                <Route path="/receitas" element={<Receita/>} />
                <Route path="/despesas" element={<Despesa/>} />
                <Route path="/compras" element={<Compras/>} />
                <Route path="/faturas" element={<Faturas/>} />
            </Routes>
        </Router>
    );
};

export default AppRouter
