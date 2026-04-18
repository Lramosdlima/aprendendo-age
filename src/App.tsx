import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { AldeaoDetailPage } from "@/pages/AldeaoDetailPage";
import { AldeoesPage } from "@/pages/AldeoesPage";
import { ConstrucaoDetailPage } from "@/pages/ConstrucaoDetailPage";
import { ConstrucoesPage } from "@/pages/ConstrucoesPage";
import { DeusDetailPage } from "@/pages/DeusDetailPage";
import { DeusesPage } from "@/pages/DeusesPage";
import { EraDetailPage } from "@/pages/EraDetailPage";
import { ErasPage } from "@/pages/ErasPage";
import { GodpowerDetailPage } from "@/pages/GodpowerDetailPage";
import { GodpowersPage } from "@/pages/GodpowersPage";
import { HomePage } from "@/pages/HomePage";
import { MapaDetailPage } from "@/pages/MapaDetailPage";
import { MapasPage } from "@/pages/MapasPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PanteaoDetailPage } from "@/pages/PanteaoDetailPage";
import { PanteoesPage } from "@/pages/PanteoesPage";
import { StartDetailPage } from "@/pages/StartDetailPage";
import { StartsPage } from "@/pages/StartsPage";
import { TecnologiaDetailPage } from "@/pages/TecnologiaDetailPage";
import { TecnologiasPage } from "@/pages/TecnologiasPage";
import { UnidadeDetailPage } from "@/pages/UnidadeDetailPage";
import { UnidadesPage } from "@/pages/UnidadesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="panteoes" element={<PanteoesPage />} />
          <Route path="panteoes/:id" element={<PanteaoDetailPage />} />
          <Route path="deuses" element={<DeusesPage />} />
          <Route path="deuses/:id" element={<DeusDetailPage />} />
          <Route path="eras" element={<ErasPage />} />
          <Route path="eras/:id" element={<EraDetailPage />} />
          <Route path="poderes" element={<GodpowersPage />} />
          <Route path="poderes/:id" element={<GodpowerDetailPage />} />
          <Route path="construcoes" element={<ConstrucoesPage />} />
          <Route path="construcoes/:id" element={<ConstrucaoDetailPage />} />
          <Route path="unidades" element={<UnidadesPage />} />
          <Route path="unidades/:id" element={<UnidadeDetailPage />} />
          <Route path="aldeoes" element={<AldeoesPage />} />
          <Route path="aldeoes/:id" element={<AldeaoDetailPage />} />
          <Route path="mapas" element={<MapasPage />} />
          <Route path="mapas/:index" element={<MapaDetailPage />} />
          <Route path="tecnologias" element={<TecnologiasPage />} />
          <Route path="tecnologias/:index" element={<TecnologiaDetailPage />} />
          <Route path="starts" element={<StartsPage />} />
          <Route path="starts/:id" element={<StartDetailPage />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
