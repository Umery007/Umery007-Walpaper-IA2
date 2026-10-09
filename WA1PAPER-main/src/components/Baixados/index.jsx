import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import wallpaper from "../../assets/img-cards/paper.jpeg";
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

const wallpapers = Array.from({ length: 120 }, (_, index) => ({
	id: index + 1,
	position: `${(index * 17) % 100}% ${(index * 29) % 100}%`,
}));

export default function Baixados() {
	const navigate = useNavigate();
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(getPageSize);

	useEffect(() => {
		function updatePageSize() {
			setPageSize(getPageSize());
			setPage(0);
		}

		window.addEventListener("resize", updatePageSize);
		return () => window.removeEventListener("resize", updatePageSize);
	}, []);

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
				<CountLabel>365 Pins Baixados</CountLabel>
				<PageIndicator>
					Página {page + 1} de {pages.length}
				</PageIndicator>

					{hasMultiplePages && (
						<GalleryButton type="button" aria-label="Página anterior" $side="left" onClick={showPreviousPage} disabled={page === 0}>
							<ChevronLeft size={24} />
						</GalleryButton>
					)}

				<WallpaperGrid key={page}>
					{pages[page].map(({ id, position }) => (
						<WallpaperCard
							key={id}
							role="link"
							tabIndex={0}
							aria-label={`Abrir wallpaper baixado ${id}`}
							onClick={() => navigate("/pin")}
							onKeyDown={(event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									navigate("/pin");
								}
							}}
						>
							<WallpaperImage src={wallpaper} alt={`Wallpaper baixado ${id}`} style={{ objectPosition: position }} />
						</WallpaperCard>
					))}
				</WallpaperGrid>

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
