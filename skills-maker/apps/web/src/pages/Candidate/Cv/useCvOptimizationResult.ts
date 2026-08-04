import { useCallback, useState } from 'react'

export type FullscreenPanel = 'original' | 'optimized' | null

export const useCvOptimizationResult = (optimizedHtml: string) => {
  const [fullscreenPanel, setFullscreenPanel] = useState<FullscreenPanel>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const openFullscreen = (panel: Exclude<FullscreenPanel, null>) => setFullscreenPanel(panel)
  const closeFullscreen = () => setFullscreenPanel(null)

  const downloadPdf = useCallback(
    async (element: HTMLElement | null) => {
      if (!element) return
      setIsDownloading(true)
      try {
        const html2pdf = (await import('html2pdf.js')).default
        await html2pdf()
          .set({
            margin: 0,
            filename: 'cv-optimise-ats.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          })
          .from(element)
          .save()
      } catch {
        // Fallback: open the browser print dialog with the optimized HTML.
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(
            `<!DOCTYPE html><html><head><title>CV</title></head><body>${optimizedHtml}</body></html>`,
          )
          printWindow.document.close()
          printWindow.print()
        }
      } finally {
        setIsDownloading(false)
      }
    },
    [optimizedHtml],
  )

  return { fullscreenPanel, openFullscreen, closeFullscreen, isDownloading, downloadPdf }
}
