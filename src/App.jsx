import { useRef, useState, useMemo } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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

  // GRID
  const cols =
    layout === '2x2' ? 'grid-cols-2' :
    layout === '2x3' ? 'grid-cols-2' :
    layout === '3x2' ? 'grid-cols-3' :
    'grid-cols-3'

  // SPLIT PAGE
  const pages = useMemo(() => {

    const result = []

    for (let i = 0; i < photos.length; i += pageSize) {
      result.push(photos.slice(i, i + pageSize))
    }

    return result

  }, [photos, pageSize])

  const currentPage = pages[pageIndex] || []

  // UPLOAD
  const handleUpload = async (e) => {

    const files = Array.from(e.target.files || [])

    const readFile = (file) => {
      return new Promise((resolve) => {

        const reader = new FileReader()

        reader.onload = () => {
          resolve({
            url: reader.result
          })
        }

        reader.readAsDataURL(file)
      })
    }

    const images = await Promise.all(
      files.map(readFile)
    )

    setPhotos(prev => [...prev, ...images])

    setPageIndex(0)
  }

  // RESET
  const resetAll = () => {

    setPhotos([])
    setCaptions({})
    setPageIndex(0)
  }

  // NEXT PAGE
  const nextPage = () => {

    if (pageIndex < pages.length - 1) {
      setPageIndex(prev => prev + 1)
    }
  }

  // PREV PAGE
  const prevPage = () => {

    if (pageIndex > 0) {
      setPageIndex(prev => prev - 1)
    }
  }

  // EXPORT JPG
  const exportCurrentPage = async () => {

    if (!previewRef.current) return

    try {

      const canvas = await html2canvas(
        previewRef.current,
        {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        }
      )

      const link = document.createElement('a')

      link.download =
        'page-' + (pageIndex + 1) + '.jpg'

      link.href =
        canvas.toDataURL('image/jpeg', 1.0)

      document.body.appendChild(link)

      link.click()

      document.body.removeChild(link)

    } catch (error) {

      console.error(error)

      alert('Gagal export JPG')
    }
  }

  // EXPORT PDF
  const exportPDF = async () => {

    if (!previewRef.current) return

    try {

      const canvas = await html2canvas(
        previewRef.current,
        {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        }
      )

      const imgData =
        canvas.toDataURL('image/jpeg', 1.0)

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = 210

      const pdfHeight =
        (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(
        imgData,
        'JPEG',
        0,
        0,
        pdfWidth,
        pdfHeight
      )

      pdf.save(
        'dokumentasi-' +
        Date.now() +
        '.pdf'
      )

    } catch (error) {

      console.error(error)

      alert('Gagal membuat PDF')
    }
  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PANEL */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">

          <div>

            <h1 className="text-2xl font-bold">
              Auto Photo Report
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Dokumentasi otomatis multi halaman
            </p>

          </div>

          {/* LAYOUT */}
          <div className="space-y-2">

            <p className="font-medium">
              Pilih Layout
            </p>

            <div className="grid grid-cols-2 gap-2">

              {['2x2', '2x3', '3x2', '3x3'].map((item) => (

                <button
                  key={item}
                  onClick={() => {
                    setLayout(item)
                    setPageIndex(0)
                  }}
                  className={`py-2 rounded-xl border ${
                    layout === item
                      ? 'bg-black text-white'
                      : 'bg-white'
                  }`}
                >
                  {item}
                </button>

              ))}

            </div>
          </div>

          {/* UPLOAD */}
          <div className="border-2 border-dashed rounded-2xl p-8 text-center bg-gray-50">

            <p className="font-medium">
              Upload Foto
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Unlimited Foto
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />

            <button
              onClick={() => inputRef.current.click()}
              className="mt-4 px-4 py-2 rounded-xl bg-black text-white"
            >
              Pilih Foto
            </button>

          </div>

          {/* PAGE NAV */}
          <div className="flex gap-2">

            <button
              onClick={prevPage}
              className="w-full border rounded-xl py-3"
            >
              Prev
            </button>

            <button
              onClick={nextPage}
              className="w-full border rounded-xl py-3"
            >
              Next
            </button>

          </div>

          {/* ACTION */}
          <div className="grid grid-cols-1 gap-3">

            <button
              onClick={exportCurrentPage}
              className="rounded-xl bg-black text-white py-3 font-medium"
            >
              Export JPG
            </button>

            <button
              onClick={exportPDF}
              className="rounded-xl bg-blue-600 text-white py-3 font-medium"
            >
              Save as PDF
            </button>

            <button
              onClick={resetAll}
              className="rounded-xl border py-3 font-medium text-red-600"
            >
              Reset
            </button>

          </div>

          {/* CAPTION */}
          <div className="space-y-3 max-h-[320px] overflow-auto">

            <h2 className="font-semibold">
              Keterangan Foto
            </h2>

            {Array.from({
              length: photos.length
            }).map((_, index) => (

              <input
                key={index}
                value={captions[index] || ''}
                onChange={(e) =>
                  setCaptions((prev) => ({
                    ...prev,
                    [index]: e.target.value,
                  }))
                }
                className="w-full border rounded-xl px-4 py-3"
                placeholder={
                  'Keterangan Foto ' +
                  (index + 1)
                }
              />

            ))}

          </div>

        </div>

        {/* PREVIEW */}
        <div className="lg:col-span-2 bg-gray-200 rounded-3xl p-6 overflow-auto">

          <div
            ref={previewRef}
            className="mx-auto bg-white shadow-xl w-full max-w-[850px] p-6 rounded-xl"
          >

            {/* TITLE */}
            <div className="text-center mb-6">

              <h1 className="text-2xl font-bold">
                DOKUMENTASI FOTO
              </h1>

              <p className="text-sm text-gray-500">
                Page {pageIndex + 1} / {pages.length || 1}
              </p>

            </div>

            {/* GRID */}
            <div className={`grid ${cols} gap-4`}>

              {currentPage.map((photo, index) => {

                const globalIndex =
                  pageIndex * pageSize + index

                return (

                  <div
                    key={globalIndex}
                    className="flex flex-col"
                  >

                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-gray-100">

                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />

                    </div>

                    <div className="mt-2 text-center text-xs text-gray-700">

                      {captions[globalIndex] ||
                        ('Foto ' + (globalIndex + 1))}

                    </div>

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