import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest, isProtectedWallpaperImage } from "../../services/api";
import useAuth from "../../contexts/useAuth";
import {
	BackButton,
	DownloadedPage,
	DownloadedPanel,
	Header,
	HeaderTitle,
	CountLabel,
	PageIndicator,
	WallpaperGrid,
	WallpaperCard,
	WallpaperImage,
	GalleryButton,
} from "./styles";

export default function Baixados() {
	const navigate = useNavigate();
	const { user, loading: loadingUser } = useAuth();
	const [result, setResult] = useState({ userId: null, wallpapers: [], error: "" });
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(getPageSize);

	useEffect(() => {
		if (loadingUser || !user) return undefined;

		let active = true;
		setPage(0);
		apiRequest("/wallpapers/downloads")
			.then((data) => {
				if (active) setResult({ userId: user.id, wallpapers: data.wallpapers, error: "" });
			})
			.catch((error) => {
				if (active) setResult({ userId: user.id, wallpapers: [], error: error.message });
			});

		return () => { active = false; };
	}, [loadingUser, user]);

	useEffect(() => {
		function updatePageSize() {
			setPageSize(getPageSize());
			setPage(0);
		}

		window.addEventListener("resize", updatePageSize);
		return () => window.removeEventListener("resize", updatePageSize);
	}, []);

	const wallpapers = result.userId === user?.id ? result.wallpapers : [];
	const pages = Array.from({ length: Math.ceil(wallpapers.length / pageSize) }, (_, index) =>
		wallpapers.slice(index * pageSize, (index + 1) * pageSize),
	);
	const hasMultiplePages = pages.length > 1;

	function showPreviousPage() {
		setPage((currentPage) => Math.max(currentPage - 1, 0));
	}

	function showNextPage() {
		setPage((currentPage) => Math.min(currentPage + 1, pages.length - 1));
	}

	return (
		<DownloadedPage>
			<BackButton type="button" aria-label="Voltar" onClick={() => navigate(-1)}>
				<ArrowLeft size={20} strokeWidth={1.6} />
			</BackButton>
			<Header>
				<HeaderTitle>Wallpapers Baixados por você</HeaderTitle>
			</Header>

			<DownloadedPanel>
				<CountLabel>{wallpapers.length} Wallpapers Baixados</CountLabel>
				{wallpapers.length > 0 && (
					<PageIndicator>Página {page + 1} de {pages.length}</PageIndicator>
				)}

					{hasMultiplePages && (
						<GalleryButton type="button" aria-label="Página anterior" $side="left" onClick={showPreviousPage} disabled={page === 0}>
							<ChevronLeft size={24} />
						</GalleryButton>
					)}

				{loadingUser || (user && result.userId !== user.id) ? (
					<p role="status">Carregando seus downloads...</p>
				) : !user ? (
					<p>Entre na sua conta para ver os wallpapers baixados.</p>
				) : result.error ? (
					<p role="alert">{result.error}</p>
				) : wallpapers.length === 0 ? (
					<p>Você ainda não baixou nenhum wallpaper.</p>
				) : (
				<WallpaperGrid key={page}>
					{(pages[page] ?? []).map((wallpaper) => (
						<WallpaperCard
							key={wallpaper.id}
							role="link"
							tabIndex={0}
							aria-label={`Abrir wallpaper baixado ${wallpaper.title}`}
							onClick={() => navigate("/pin", { state: { wallpaper } })}
							onKeyDown={(event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									navigate("/pin", { state: { wallpaper } });
								}
							}}
						>
							<WallpaperImage
								src={wallpaper.image_url}
								alt={wallpaper.title}
								crossOrigin={isProtectedWallpaperImage(wallpaper.image_url) ? "use-credentials" : undefined}
							/>
						</WallpaperCard>
					))}
				</WallpaperGrid>
				)}

				{hasMultiplePages && (
					<GalleryButton type="button" aria-label="Próxima página" $side="right" onClick={showNextPage} disabled={page === pages.length - 1}>
						<ChevronRight size={24} />
					</GalleryButton>
				)}
			</DownloadedPanel>
		</DownloadedPage>
	);
}

function getPageSize() {
	return 25;
}
