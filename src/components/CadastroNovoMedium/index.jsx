import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig'; // Ajuste o caminho

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Cadastro() {
    const [nome, setNome] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const docRef = await addDoc(collection(db, 'mediuns'), {
                nome: nome,
                debito_total: 0, // Inicializa o débito total como 0
            });
            console.log('Médium cadastrado com ID: ', docRef.id);
            setSuccessMessage('Médium cadastrado com sucesso!');
            setNome('');
        } catch (error) {
            console.error('Erro ao cadastrar médium:', error);
            setErrorMessage('Erro ao cadastrar médium. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cadastro de Médium</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="nome" className="mb-2">Nome</Label>
                        <Input
                            type="text"
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                </form>
                {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
                {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
            </CardContent>
        </Card>
    );
}

export default Cadastro;