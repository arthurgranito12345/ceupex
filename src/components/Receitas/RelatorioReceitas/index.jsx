import React, { useState, useEffect, useCallback } from 'react';
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    getDoc,
    updateDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { format, fromUnixTime } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';

function RelatorioReceitas() {
    const [receitas, setReceitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [receitaToDeleteId, setReceitaToDeleteId] = useState(null);
    const receitasDocRef = doc(db, 'receitas', 'Y2zlodrLAkak0sCTrso9');
    const [dataInicialFiltro, setDataInicialFiltro] = useState('');
    const [dataFinalFiltro, setDataFinalFiltro] = useState('');
    const [descricaoFiltro, setDescricaoFiltro] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [receitasFiltradas, setReceitasFiltradas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [ordenacao, setOrdenacao] = useState(null);
    const [direcaoOrdenacao, setDirecaoOrdenacao] = useState('desc');

    useEffect(() => {
        const fetchReceitas = async () => {
            try {
                const receitasCollectionRef = collection(receitasDocRef, 'receitas');
                const querySnapshot = await getDocs(receitasCollectionRef);
                const receitasData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                // Ordenar as receitas por data de forma crescente na busca inicial
                const sortedReceitas = [...receitasData].sort((a, b) => {
                    const dateA = a.data?.seconds ? new Date(a.data.seconds * 1000) : new Date(a.data);
                    const dateB = b.data?.seconds ? new Date(b.data.seconds * 1000) : new Date(b.data);
                    return dateA.getTime() - dateB.getTime();
                });
                setReceitas(sortedReceitas);
                setReceitasFiltradas(sortedReceitas); // Inicializar receitasFiltradas também ordenadas
                setLoading(false);
            } catch (err) {
                console.error('Erro ao buscar receitas:', err);
                setError('Erro ao carregar o relatório de receitas.');
                setLoading(false);
            }
        };

        const fetchCategorias = async () => {
            try {
                const categoriasDocRef = doc(db, 'categorias', 'NUHFBehq9RrPSXBOtCQf');
                const categoriasCollectionRef = collection(categoriasDocRef, 'receitas');
                const querySnapshot = await getDocs(categoriasCollectionRef);
                const categoriasData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    nome: doc.data()?.nome
                }));
                setCategorias([{ id: null, nome: 'Todas as Categorias' }, ...categoriasData]);
            } catch (err) {
                console.error('Erro ao buscar categorias:', err);
            }
        };

        fetchReceitas();
        fetchCategorias();
    }, []);

    const formatDate = (date) => {
        if (!date) return 'Data inválida';

        let jsDate;
        if (date instanceof Date) {
            jsDate = date;
        } else if (date && date.seconds !== undefined) {
            jsDate = fromUnixTime(date.seconds);
        } else if (typeof date === 'string') {
            const parts = date.split('/');
            if (parts.length === 3) {
                jsDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
                if (isNaN(jsDate.getTime())) return 'Data inválida';
            } else {
                return 'Data inválida';
            }
        } else if (date instanceof Timestamp) {
            jsDate = fromUnixTime(date.seconds);
        } else {
            return 'Data inválida';
        }

        return format(jsDate, 'dd/MM/yyyy', { locale: ptBR });
    };

    const handleOrdenar = (coluna) => {
        if (coluna === ordenacao) {
            setDirecaoOrdenacao(direcaoOrdenacao === 'asc' ? 'desc' : 'asc');
        } else {
            setOrdenacao(coluna);
            setDirecaoOrdenacao('asc');
        }
        // Ordenar imediatamente quando a ordenação for alterada
        setReceitasFiltradas(ordenarReceitas(receitas)); // Usar 'receitas' em vez de 'receitasFiltradas'
    };

    const ordenarReceitas = useCallback((listaDeReceitas) => {
        if (!ordenacao) return listaDeReceitas;

        return [...listaDeReceitas].sort((a, b) => {
            let valorA, valorB;

            switch (ordenacao) {
                case 'data':
                    valorA = a.data?.seconds ? new Date(a.data.seconds * 1000) : new Date(a.data);
                    valorB = b.data?.seconds ? new Date(b.data.seconds * 1000) : new Date(b.data);
                    break;
                default:
                    return 0;
            }

            if (valorA < valorB) {
                return direcaoOrdenacao === 'asc' ? -1 : 1;
            }
            if (valorA > valorB) {
                return direcaoOrdenacao === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [ordenacao, direcaoOrdenacao]);

    const filtrarReceitas = useCallback(() => {
        const dataInicial = dataInicialFiltro ? new Date(dataInicialFiltro) : null;
        const dataFinal = dataFinalFiltro ? new Date(dataFinalFiltro) : null;
        const termoDescricao = descricaoFiltro.toLowerCase();
        const categoriaSelecionada = categoriaFiltro;

        let resultadosFiltrados = receitas.filter(receita => {
            const receitaDate = receita.data?.seconds ? new Date(receita.data.seconds * 1000) : new Date(receita.data);
            const formattedReceitaDate = format(receitaDate, 'yyyy-MM-dd');
            const descricaoLowerCase = receita.descricao?.toLowerCase() || '';
            const receitaCategoria = receita.categoria || '';

            const filtroData = (!dataInicial || formattedReceitaDate >= format(dataInicial, 'yyyy-MM-dd')) &&
                (!dataFinal || formattedReceitaDate <= format(dataFinal, 'yyyy-MM-dd'));

            const filtroDescricao = !descricaoFiltro || descricaoLowerCase.includes(termoDescricao);

            const filtroCategoria = !categoriaSelecionada || receitaCategoria === categoriaSelecionada;

            return filtroData && filtroDescricao && filtroCategoria;
        });

        setReceitasFiltradas(ordenarReceitas(resultadosFiltrados));
    }, [receitas, dataInicialFiltro, dataFinalFiltro, descricaoFiltro, categoriaFiltro, ordenarReceitas]);

    useEffect(() => {
        filtrarReceitas();
    }, [receitas, dataInicialFiltro, dataFinalFiltro, descricaoFiltro, categoriaFiltro, filtrarReceitas]);

    if (loading) {
        return <div>Carregando relatório de receitas...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Relatório de Receitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <Label htmlFor="dataInicialFiltro" className="mb-2">Data Inicial</Label>
                        <Input
                            type="date"
                            id="dataInicialFiltro"
                            value={dataInicialFiltro}
                            onChange={(e) => setDataInicialFiltro(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="dataFinalFiltro" className="mb-2">Data Final</Label>
                        <Input
                            type="date"
                            id="dataFinalFiltro"
                            value={dataFinalFiltro}
                            onChange={(e) => setDataFinalFiltro(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="descricaoFiltro" className="mb-2">Pesquisar Descrição</Label>
                        <Input
                            type="text"
                            id="descricaoFiltro"
                            placeholder="Digite a descrição..."
                            value={descricaoFiltro}
                            onChange={(e) => setDescricaoFiltro(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="categoriaFiltro" className="mb-2">Filtrar por Categoria</Label>
                        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todas as Categorias" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>Todas as Categorias</SelectItem>
                                {categorias.slice(1).map((categoria) => (
                                    <SelectItem key={categoria.id} value={categoria.nome}>{categoria.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer" onClick={() => handleOrdenar('data')}>
                                    Data
                                    {ordenacao === 'data' && (direcaoOrdenacao === 'asc' ? ' ▲' : ' ▼')}
                                </TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Referência</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receitasFiltradas.map(receita => (
                                <TableRow key={receita.id}>
                                    <TableCell>{formatDate(receita.data)}</TableCell>
                                    <TableCell className="capitalize">{receita.categoria}</TableCell>
                                    <TableCell className="capitalize">{receita.descricao}</TableCell>
                                    <TableCell className="capitalize">{receita.referencia}</TableCell>
                                    <TableCell className="text-right">R$ {receita.valor?.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export default RelatorioReceitas;