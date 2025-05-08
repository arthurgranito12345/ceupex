import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDocs, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

function CadastroReceita() {
    const [categoria, setCategoria] = useState('');
    const [data, setData] = useState('');
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [referencia, setReferencia] = useState('');
    const [categoriasReceita, setCategoriasReceita] = useState([]);
    const [isMedium, setIsMedium] = useState(false);
    const [allMediuns, setAllMediuns] = useState([]);
    const [filteredMediuns, setFilteredMediuns] = useState([]);
    const [searchTermMedium, setSearchTermMedium] = useState('');
    const [selectedMediumId, setSelectedMediumId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCategoriasReceita = async () => {
            try {
                const receitasDocRef = doc(db, 'categorias', 'NUHFBehq9RrPSXBOtCQf');
                const receitasCategoriasCollection = collection(receitasDocRef, 'receitas');
                const querySnapshot = await getDocs(receitasCategoriasCollection);
                const categoriasList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    nome: doc.data().nome,
                }));
                setCategoriasReceita(categoriasList);
            } catch (error) {
                console.error('Erro ao buscar categorias de receita:', error);
            }
        };

        fetchCategoriasReceita();
    }, []);

    useEffect(() => {
        const fetchMediuns = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'mediuns'));
                const mediunsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    nome: doc.data().nome,
                }));
                setAllMediuns(mediunsList);
                setFilteredMediuns(mediunsList);
            } catch (error) {
                console.error('Erro ao buscar médiuns:', error);
            }
        };

        if (isMedium) {
            fetchMediuns();
        } else {
            setAllMediuns([]);
            setFilteredMediuns([]);
            setSearchTermMedium('');
            setSelectedMediumId('');
        }
    }, [isMedium]);

    const handleIsMediumChange = (checked) => {
        setIsMedium(checked);
        setDescricao('');
        setSelectedMediumId('');
        setSearchTermMedium('');
    };

    const handleSearchMedium = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTermMedium(term);
        const filtered = allMediuns.filter(medium =>
            medium.nome.toLowerCase().includes(term)
        );
        setFilteredMediuns(filtered);
    };

    const handleMediumSelectChange = (value) => {
        setSelectedMediumId(value);
        const selectedMedium = allMediuns.find(medium => medium.id === value);
        setDescricao(selectedMedium?.nome || '');
    };

    const handleDescricaoInputChange = (e) => {
        setDescricao(e.target.value);
    };

    const handleReferenciaInputChange = (e) => {
        setReferencia(e.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            if (!data || !data.includes('-')) {
                throw new Error('Data inválida. Por favor, selecione uma data válida.');
            }

            const [ano, mes, dia] = data.split('-');
            const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
            if (isNaN(dataObj)) {
                throw new Error('Data inválida.');
            }
            const timestamp = Timestamp.fromDate(dataObj);

            const receitasDocRef = doc(db, 'receitas', 'Y2zlodrLAkak0sCTrso9');
            const receitasCollectionRef = collection(receitasDocRef, 'receitas');

            await addDoc(receitasCollectionRef, {
                categoria,
                data: timestamp,
                descricao,
                referencia,
                valor: parseFloat(valor),
            });

            if (isMedium && selectedMediumId) {
                const contribuicoesRef = collection(db, 'mediuns', selectedMediumId, 'contribuicoes');
                await addDoc(contribuicoesRef, {
                    data: timestamp,
                    valor: parseFloat(valor),
                    tipo: 'pagamento',
                    descricao: categoria,
                });

                const mediumRef = doc(db, 'mediuns', selectedMediumId);
                const mediumSnap = await getDoc(mediumRef);
                if (mediumSnap.exists()) {
                    const currentDebitoTotal = mediumSnap.data().debito_total || 0;
                    const novoDebitoTotal = currentDebitoTotal - parseFloat(valor);
                    await updateDoc(mediumRef, {
                        debito_total: novoDebitoTotal < 0 ? 0 : novoDebitoTotal
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao cadastrar receita/contribuição:', error);
            alert('Erro: ' + error.message);
        } finally {
            setCategoria('');
            setData('');
            setDescricao('');
            setValor('');
            setReferencia('');
            setIsMedium(false);
            setSearchTermMedium('');
            setSelectedMediumId('');
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cadastro de Receita</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="data" className="mb-2">Data</Label>
                        <Input
                            type="date"
                            id="data"
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="categoria" className="mb-2">Categoria</Label>
                        <Select value={categoria} onValueChange={setCategoria} required>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoriasReceita.map(cat => (
                                    <SelectItem key={cat.id} value={cat.nome}>
                                        {cat.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="descricao" className="mb-2">Descrição</Label>
                        {isMedium ? (
                            <>
                                <Input
                                    type="text"
                                    id="medium-search"
                                    placeholder="Pesquisar médium..."
                                    value={searchTermMedium}
                                    onChange={handleSearchMedium}
                                    className="mb-2"
                                />
                                <Select value={selectedMediumId} onValueChange={handleMediumSelectChange} required>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione o médium" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredMediuns.map(medium => (
                                            <SelectItem key={medium.id} value={medium.id}>
                                                {medium.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        ) : (
                            <Input
                                type="text"
                                id="descricao"
                                value={descricao}
                                onChange={handleDescricaoInputChange}
                            />
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is-medium"
                            checked={isMedium}
                            onCheckedChange={handleIsMediumChange}
                        />
                        <Label htmlFor="is-medium">É médium?</Label>
                    </div>
                    <div>
                        <Label htmlFor="referencia" className="mb-2">Referência</Label>
                        <Input
                            type="text"
                            id="referencia"
                            value={referencia}
                            onChange={handleReferenciaInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="valor" className="mb-2">Valor</Label>
                        <Input
                            type="text"
                            id="valor"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Cadastrando...' : 'Cadastrar Receita'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default CadastroReceita;