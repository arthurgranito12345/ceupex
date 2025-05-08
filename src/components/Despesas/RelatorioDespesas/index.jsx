import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc, // Importe getDoc
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { format, fromUnixTime } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

function RelatorioDespesas() {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const despesasDocRef = doc(
    db,
    "despesas_relatorio",
    "seuDocumentoDeRelatorioDespesas"
  ); // Ajuste o ID se necessário
  const [dataInicialFiltro, setDataInicialFiltro] = useState("");
  const [dataFinalFiltro, setDataFinalFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState("");
  const [descricaoFiltro, setDescricaoFiltro] = useState("");
  const [despesasFiltradas, setDespesasFiltradas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [ordenacao, setOrdenacao] = useState(null);
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState("desc");

  useEffect(() => {
    const fetchDespesas = async () => {
      try {
        const despesasCollectionRef = collection(db, "despesas");
        const querySnapshot = await getDocs(despesasCollectionRef);
        const despesasData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Adicionando o log das despesas no formato de objeto
        console.log("Todas as despesas carregadas:", despesasData);

        const sortedDespesas = [...despesasData].sort((a, b) => {
          const dateA = a.data?.seconds
            ? new Date(a.data.seconds * 1000)
            : new Date(a.data);
          const dateB = b.data?.seconds
            ? new Date(b.data.seconds * 1000)
            : new Date(b.data);
          return dateA.getTime() - dateB.getTime();
        });
        setDespesas(sortedDespesas);
        setDespesasFiltradas(sortedDespesas);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar despesas:", err);
        setError("Erro ao carregar o relatório de despesas.");
        setLoading(false);
      }
    };

    const fetchCategorias = async () => {
      try {
        const categoriasDocRef = doc(db, "categorias", "uACDVZ0RaQKMFrTBcSkF");
        const docSnap = await getDoc(categoriasDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const categoriasData = data.categorias || [];
          setCategorias([
            { id: null, nome: "Todas as Categorias", subcategorias: [] },
            ...categoriasData,
          ]);
        } else {
          console.log("Nenhum documento de categorias encontrado!");
          setCategorias([
            { id: null, nome: "Todas as Categorias", subcategorias: [] },
          ]);
        }
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        setCategorias([
          { id: null, nome: "Todas as Categorias", subcategorias: [] },
        ]);
      }
    };

    fetchDespesas();
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (categoriaFiltro) {
      const categoriaSelecionada = categorias.find(
        (cat) => cat.nome === categoriaFiltro
      );
      let subcategoriasCorrigidas = [];
      if (categoriaSelecionada?.subcategorias) {
        subcategoriasCorrigidas = categoriaSelecionada.subcategorias.map(
          (sub) => {
            if (sub.nome === "Utensílios de Cozinha") {
              return { ...sub, nome: "Untensílios de Cozinha" }; // Correção aqui!
            }
            return sub;
          }
        );
      }
      setSubcategorias([
        { nome: "Todas as Subcategorias" },
        ...subcategoriasCorrigidas,
      ]);
      setSubcategoriaFiltro("");
    } else {
      setSubcategorias([{ nome: "Todas as Subcategorias" }]);
      setSubcategoriaFiltro("");
    }
  }, [categoriaFiltro, categorias]);

  const formatDate = (date) => {
    if (!date) return "Data inválida";

    let jsDate;
    if (date instanceof Date) {
      jsDate = date;
    } else if (date && date.seconds !== undefined) {
      jsDate = fromUnixTime(date.seconds);
    } else {
      return "Data inválida";
    }

    return format(jsDate, "dd/MM/yyyy", { locale: ptBR });
  };

  const handleOrdenar = (coluna) => {
    if (coluna === ordenacao) {
      setDirecaoOrdenacao(direcaoOrdenacao === "asc" ? "desc" : "asc");
    } else {
      setOrdenacao(coluna);
      setDirecaoOrdenacao("asc");
    }
    setDespesasFiltradas(ordenarDespesas(despesas));
  };

  const ordenarDespesas = useCallback(
    (listaDeDespesas) => {
      if (!ordenacao) return listaDeDespesas;

      return [...listaDeDespesas].sort((a, b) => {
        let valorA, valorB;

        switch (ordenacao) {
          case "data":
            valorA = a.data?.seconds
              ? new Date(a.data.seconds * 1000)
              : new Date(a.data);
            valorB = b.data?.seconds
              ? new Date(b.data.seconds * 1000)
              : new Date(b.data);
            break;
          case "categoria":
            valorA = a.categoria || "";
            valorB = b.categoria || "";
            break;
          case "subcategoria":
            valorA = a.subcategoria || "";
            valorB = b.subcategoria || "";
            break;
          case "descricao":
            valorA = a.descricao || "";
            valorB = b.descricao || "";
            break;
          case "valor":
            valorA = a.valor || 0;
            valorB = b.valor || 0;
            break;
          default:
            return 0;
        }

        if (typeof valorA === "string" && typeof valorB === "string") {
          return direcaoOrdenacao === "asc"
            ? valorA.localeCompare(valorB)
            : valorB.localeCompare(valorA);
        }

        if (valorA < valorB) {
          return direcaoOrdenacao === "asc" ? -1 : 1;
        }
        if (valorA > valorB) {
          return direcaoOrdenacao === "asc" ? 1 : -1;
        }
        return 0;
      });
    },
    [ordenacao, direcaoOrdenacao]
  );

  const filtrarDespesas = useCallback(() => {
    const dataInicial = dataInicialFiltro ? new Date(dataInicialFiltro) : null;
    const dataFinal = dataFinalFiltro ? new Date(dataFinalFiltro) : null;
    const termoDescricao = descricaoFiltro.toLowerCase();
    const categoriaSelecionada = categoriaFiltro;
    const subcategoriaSelecionada = subcategoriaFiltro;

    let resultadosFiltrados = despesas.filter((despesa) => {
      const despesaDate = despesa.data?.seconds
        ? new Date(despesa.data.seconds * 1000)
        : new Date(despesa.data);
      const formattedDespesaDate = format(despesaDate, "yyyy-MM-dd");
      const descricaoLowerCase = despesa.descricao?.toLowerCase() || "";
      const despesaCategoria = despesa.categoria || "";
      const despesaSubcategoria = despesa.subcategoria || "";

      const filtroData =
        (!dataInicial ||
          formattedDespesaDate >= format(dataInicial, "yyyy-MM-dd")) &&
        (!dataFinal || formattedDespesaDate <= format(dataFinal, "yyyy-MM-dd"));

      const filtroDescricao =
        !descricaoFiltro || descricaoLowerCase.includes(termoDescricao);

      let filtroCategoria = true;
      if (
        categoriaSelecionada &&
        categoriaSelecionada !== "Todas as Categorias" &&
        categoriaSelecionada !== ""
      ) {
        filtroCategoria = despesaCategoria === categoriaSelecionada;
      }

      const filtroSubcategoria =
        !subcategoriaSelecionada ||
        subcategoriaSelecionada === "Todas as Subcategorias" ||
        despesaSubcategoria === subcategoriaSelecionada;

      return (
        filtroData && filtroDescricao && filtroCategoria && filtroSubcategoria
      );
    });

    setDespesasFiltradas(ordenarDespesas(resultadosFiltrados));
  }, [
    despesas,
    dataInicialFiltro,
    dataFinalFiltro,
    descricaoFiltro,
    categoriaFiltro,
    subcategoriaFiltro,
    ordenarDespesas,
  ]);

  useEffect(() => {
    filtrarDespesas();
  }, [
    despesas,
    dataInicialFiltro,
    dataFinalFiltro,
    descricaoFiltro,
    categoriaFiltro,
    subcategoriaFiltro,
    filtrarDespesas,
  ]);

  if (loading) {
    return <div>Carregando relatório de despesas...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Despesas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dataInicialFiltro" className="mb-2">
                Data Inicial
              </Label>
              <Input
                type="date"
                id="dataInicialFiltro"
                value={dataInicialFiltro}
                onChange={(e) => setDataInicialFiltro(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dataFinalFiltro" className="mb-2">
                Data Final
              </Label>
              <Input
                type="date"
                id="dataFinalFiltro"
                value={dataFinalFiltro}
                onChange={(e) => setDataFinalFiltro(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="categoriaFiltro" className="mb-2">
                Filtrar por Categoria
              </Label>
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas as Categorias" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.filter((categoria) => categoria.nome !== "Seguros").map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.nome}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subcategoriaFiltro" className="mb-2">
                Filtrar por Subcategoria
              </Label>
              <Select
                value={subcategoriaFiltro}
                onValueChange={setSubcategoriaFiltro}
                disabled={!categoriaFiltro}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas as Subcategorias" />
                </SelectTrigger>
                <SelectContent>
                  {subcategorias.map((subcategoria) => (
                    <SelectItem key={subcategoria.nome} value={subcategoria.nome}>
                      {subcategoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="descricaoFiltro" className="mb-2">
              Pesquisar Descrição
            </Label>
            <Input
              type="text"
              id="descricaoFiltro"
              placeholder="Digite a descrição..."
              value={descricaoFiltro}
              onChange={(e) => setDescricaoFiltro(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleOrdenar("data")}
                  >
                    Data
                    {ordenacao === "data" &&
                      (direcaoOrdenacao === "asc" ? " ▲" : " ▼")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleOrdenar("categoria")}
                  >
                    Categoria
                    {ordenacao === "categoria" &&
                      (direcaoOrdenacao === "asc" ? " ▲" : " ▼")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleOrdenar("subcategoria")}
                  >
                    Subcategoria
                    {ordenacao === "subcategoria" &&
                      (direcaoOrdenacao === "asc" ? " ▲" : " ▼")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleOrdenar("descricao")}
                  >
                    Descrição
                    {ordenacao === "descricao" &&
                      (direcaoOrdenacao === "asc" ? " ▲" : " ▼")}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleOrdenar("valor")}
                  >
                    Valor
                    {ordenacao === "valor" &&
                      (direcaoOrdenacao === "asc" ? " ▲" : " ▼")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesasFiltradas.map((despesa) => (
                  <TableRow key={despesa.id}>
                    <TableCell>{formatDate(despesa.data)}</TableCell>
                    <TableCell className="capitalize">{despesa.categoria}</TableCell>
                    <TableCell className="capitalize">{despesa.subcategoria}</TableCell>
                    <TableCell className="capitalize">{despesa.descricao}</TableCell>
                    <TableCell className="text-right">
                      R$ {despesa.valor?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default RelatorioDespesas;