import { useRef, useState, useMemo } from 'react'
import html2canvas from 'html2canvas'

export default function App() {

  const [photos, setPhotos] = useState([])
  const [captions, setCaptions] = useState({})
  const [layout, setLayout] = useState('3x3')
  const [pageIndex, setPageIndex] = useState(0)

  const inputRef = useRef(null)
  const previewRef = useRef(null)

  // PAGE SIZE
  const pageSize =
    layout === '2x2' ? 4 :
    layout === '2x3' ? 6 :
    layout === '3x2' ? 6 :
    9

  const cols =
    layout === '2x2' ? 'grid-cols-2' :
    layout === '2x3' ? 'grid-cols-2' :
    layout === '3x2' ? 'grid-cols-3' :
    'grid-cols-3'

  const pages = useMemo(() => {
    const res = []
    for (let i = 0; i < photos.length; i += pageSize) {
      res.push(photos.slice(i, i + pageSize))
    }
    return res
  }, [photos, pageSize])

  const currentPage = pages[pageIndex] || []

  // UPLOAD
  const handleUpload = async (e) => {

    const files = Array.from(e.target.files || [])

    const read = (file) => new Promise((res) => {
      const r = new FileReader()
      r.onload = () => res({ url: r.result })
      r.readAsDataURL(file)
    })

    const imgs = await Promise.all(files.map(read))

    setPhotos(prev => [...prev, ...imgs])
    setPageIndex(0)
  }

  // RESET
  const resetAll = () => {
    setPhotos([])
    setCaptions({})
    setPageIndex(0)
  }

  // NEXT PREV
  const nextPage = () => {
    if (pageIndex < pages.length - 1) setPageIndex(p => p + 1)
  }

  const prevPage = () => {
    if (pageIndex > 0) setPageIndex(p => p - 1)
  }

  // EXPORT 1 PAGE
  const exportCurrentPage = async () => {

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff"
    })

    const link = document.createElement('a')
    link.download = `page-${pageIndex + 1}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 1.0)
    link.click()
  }

  // DOWNLOAD ALL (MERGE JPG)
  const downloadAll = async () => {

    const pagesEl = document.querySelectorAll('.page')

    if (!pagesEl.length) return

    const canvases = []

    for (let i = 0; i < pagesEl.length; i++) {

      const canvas = await html2canvas(pagesEl[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff"
      })

      canvases.push(canvas)
    }

    const width = canvases[0].width
    const height = canvases.reduce((a, c) => a + c.height, 0)

    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = width
    finalCanvas.height = height

    const ctx = finalCanvas.getContext('2d')

    let offsetY = 0

    canvases.forEach(c => {
      ctx.drawImage(c, 0, offsetY)
      offsetY += c.height
    })

    const link = document.createElement('a')
    link.download = `dokumentasi-${Date.now()}.jpg`
    link.href = finalCanvas.toDataURL('image/jpeg', 1.0)

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CONTROL PANEL */}
        <div className="bg-white p-6 rounded-3xl space-y-4">

          <h1 className="font-bold text-xl">Auto Photo Report</h1>

          {/* LAYOUT */}
          <div className="grid grid-cols-2 gap-2">

            {['2x2','2x3','3x2','3x3'].map(l => (
              <button
                key={l}
                onClick={() => {
                  setLayout(l)
                  setPageIndex(0)
                }}
                className={`py-2 border rounded-xl ${layout === l ? 'bg-black text-white' : ''}`}
              >
                {l}
              </button>
            ))}

          </div>

          {/* UPLOAD */}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />

          <button
            onClick={() => inputRef.current.click()}
            className="w-full py-2 bg-black text-white rounded-xl"
          >
            Upload Foto
          </button>

          {/* NAV */}
          <div className="flex gap-2">

            <button
              onClick={prevPage}
              className="w-full py-2 border rounded-xl"
            >
              Prev
            </button>

            <button
              onClick={nextPage}
              className="w-full py-2 border rounded-xl"
            >
              Next
            </button>

          </div>

          {/* EXPORT */}
          <button
            onClick={exportCurrentPage}
            className="w-full py-2 bg-black text-white rounded-xl"
          >
            Export Page (JPG)
          </button>

          <button
            onClick={downloadAll}
            className="w-full py-2 bg-green-600 text-white rounded-xl"
          >
            Download Semua (JPG)
          </button>

          {/* RESET */}
          <button
            onClick={resetAll}
            className="w-full py-2 border rounded-xl text-red-600"
          >
            Reset Semua
          </button>

          {/* CAPTION */}
          <div className="space-y-2 max-h-64 overflow-auto">

            <h2 className="font-semibold">Keterangan Foto</h2>

            {Array.from({ length: photos.length }).map((_, i) => (
              <input
                key={i}
                value={captions[i] || ''}
                onChange={(e) =>
                  setCaptions(prev => ({
                    ...prev,
                    [i]: e.target.value
                  }))
                }
                className="w-full border rounded-xl px-3 py-2 text-sm"
                placeholder={`Foto ${i + 1}`}
              />
            ))}

          </div>

        </div>

        {/* PREVIEW */}
        <div className="lg:col-span-2">

          <div
            ref={previewRef}
            className="page bg-white p-6 rounded-xl shadow mx-auto"
            style={{ width: 850 }}
          >

            <h2 className="text-center font-bold mb-4">
              PAGE {pageIndex + 1} / {pages.length || 1}
            </h2>

            <div className={`grid ${cols} gap-3`}>

              {currentPage.map((img, i) => {

                const globalIndex = pageIndex * pageSize + i

                return (

                  <div key={globalIndex}>

                    <div className="aspect-[3/4] bg-gray-200 rounded overflow-hidden">

                      <img
                        src={img.url}
                        className="w-full h-full object-cover"
                      />

                    </div>

                    <p className="text-center text-xs mt-1">
                      {captions[globalIndex] || `Foto ${globalIndex + 1}`}
                    </p>

                  </div>

                )
              })}

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}