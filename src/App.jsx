import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'

export default function App() {

  const [photos, setPhotos] = useState([])
  const [captions, setCaptions] = useState({})
  const [layout, setLayout] = useState('3x3')

  const inputRef = useRef(null)
  const previewRef = useRef(null)

  // UPLOAD FOTO
  const handleUpload = async (event) => {

    const files = Array.from(event.target.files || [])

    const readFile = (file) => {
      return new Promise((resolve) => {

        const reader = new FileReader()

        reader.onload = () => {
          resolve({
            name: file.name,
            url: reader.result,
          })
        }

        reader.readAsDataURL(file)
      })
    }

    const images = await Promise.all(
      files.map((file) => readFile(file))
    )

    setPhotos(images.slice(0, 9))
  }

  // UPDATE CAPTION
  const updateCaption = (index, value) => {
    setCaptions((prev) => ({
      ...prev,
      [index]: value,
    }))
  }

  // RESET
  const resetPhotos = () => {
    setPhotos([])
    setCaptions({})
  }

  // GET GRID CONFIG
  const getGridClass = () => {
    switch (layout) {
      case '2x2':
        return 'grid-cols-2'
      case '2x3':
        return 'grid-cols-2'
      case '3x2':
        return 'grid-cols-3'
      default:
        return 'grid-cols-3'
    }
  }

  const getMaxItems = () => {
    switch (layout) {
      case '2x2':
        return 4
      case '2x3':
        return 6
      case '3x2':
        return 6
      default:
        return 9
    }
  }

  // EXPORT JPG
  const generateJPG = async () => {

    if (!previewRef.current) return

    try {

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      })

      const link = document.createElement('a')
      link.download = `dokumentasi-${layout}-${Date.now()}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 1.0)
      link.click()

    } catch (error) {
      console.error(error)
      alert('Gagal generate JPG')
    }
  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">

          <div>
            <h1 className="text-2xl font-bold">
              Auto Photo Report
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Dokumentasi otomatis multi layout
            </p>
          </div>

          {/* LAYOUT SELECTOR */}
          <div className="space-y-2">

            <p className="font-medium">Pilih Layout</p>

            <div className="grid grid-cols-2 gap-2">

              {['2x2', '2x3', '3x2', '3x3'].map((item) => (

                <button
                  key={item}
                  onClick={() => setLayout(item)}
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

            <p className="font-medium">Upload Foto</p>

            <p className="text-sm text-gray-500 mt-2">
              Maksimal {getMaxItems()} foto
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
              onClick={() => inputRef.current?.click()}
              className="mt-4 px-4 py-2 rounded-xl bg-black text-white"
            >
              Pilih Foto
            </button>
          </div>

          {/* CAPTION */}
          <div className="space-y-3 max-h-[320px] overflow-auto">

            <h2 className="font-semibold">
              Keterangan Foto
            </h2>

            {Array.from({ length: getMaxItems() }).map((_, index) => (
              <input
                key={index}
                value={captions[index] || ''}
                onChange={(e) =>
                  updateCaption(index, e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
                placeholder={`Keterangan Foto ${index + 1}`}
              />
            ))}
          </div>

          {/* BUTTON */}
          <div className="grid grid-cols-2 gap-3">

            <button
              onClick={generateJPG}
              className="rounded-xl bg-black text-white py-3 font-medium"
            >
              Generate JPG
            </button>

            <button
              onClick={resetPhotos}
              className="rounded-xl border py-3 font-medium"
            >
              Reset
            </button>
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
                Layout {layout}
              </p>
            </div>

            {/* GRID */}
            <div className={`grid ${getGridClass()} gap-4`}>

              {Array.from({ length: getMaxItems() }).map((_, index) => {

                const photo = photos[index]

                return (
                  <div key={index} className="flex flex-col">

                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-gray-100">

                      {photo?.url ? (
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          Foto {index + 1}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-center text-xs text-gray-700">
                      {captions[index] || `Foto ${index + 1}`}
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