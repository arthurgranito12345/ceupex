import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const LegendaTotalSubCategorias = ({ totalSubCategorias, titulo, descricao }) => {
  return (
    <Card className="flex flex-col flex-1">
      <CardHeader className="items-center pb-0">
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Categoria</TableHead>
              <TableHead>Subcategoria</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {totalSubCategorias.map((categoria) => (
              <TableRow key={categoria.categoria}>
                <TableCell>{categoria.categoria}</TableCell>
                <TableCell>{categoria.subcategoria}</TableCell>
                <TableCell className="text-right">
                  R$ {categoria.total.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LegendaTotalSubCategorias;
