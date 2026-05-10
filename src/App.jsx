import { useRef, useState, useMemo } from 'react'
import html2canvas from 'html2canvas'

export default function App() {

  const [photos, setPhotos] = useState([])
  const [captions, setCaptions] = useState({})
  const [layout, setLayout] = useState('3x3')
  const [pageIndex, setPageIndex] = useState(0)

  const inputRef = useRef(null)
  const previewRef = useRef(null)

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

  const nextPage = () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex(pageIndex + 1)
    }
  }

  const prevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1)
    }
  }

  const resetAll = () => {
    setPhotos([])
    setCaptions({})
    setPageIndex(0)
  }

  const exportCurrentPage = async () => {

    const node = previewRef.current

    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff"
    })

    const a = document.createElement('a')
    a.download = `page-${pageIndex + 1}.jpg`
    a.href = canvas.toDataURL('image/jpeg', 1.0)
    a.click()
  }

  // 🔥 DOWNLOAD ALL PAGE -> 1 JPG
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
    const height = canvases.reduce((sum, c) => sum + c.height, 0)

    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = width
    finalCanvas.height = height

    const ctx = finalCanvas.getContext('2d')

    let offsetY = 0

    canvases.forEach(canvas => {
      ctx.drawImage(canvas, 0, offsetY)
      offsetY += canvas.height
    })

    const link = document.createElement('a')
    link.download = `dokumentasi-${Date.now()}.jpg`
    link.href = finalCanvas.toDataURL('image/jpeg', 1.0)
    link.click()
  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CONTROL */}
        <div className="bg-white p-6 rounded-3xl space-y-4">

          <h1 className="font-bold text-xl">Auto Report</h1>

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

          <div className="flex gap-2">

            <button
              onClick={prevPage}
              disabled={pageIndex === 0}
              className="w-full py-2 border rounded-xl disabled:opacity-40"
            >
              Prev
            </button>

            <button
              onClick={nextPage}
              disabled={pageIndex >= pages.length - 1}
              className="w-full py-2 border rounded-xl disabled:opacity-40"
            >
              Next
            </button>

          </div>

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
            Download Semua (1 JPG)
          </button>

          <button
            onClick={resetAll}
            className="w-full py-2 border rounded-xl text-red-600"
          >
            Reset Semua
          </button>

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
                      Foto {globalIndex + 1}
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