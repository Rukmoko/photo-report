import { useRef, useState, useMemo } from 'react'
import html2canvas from 'html2canvas'

import {
  DndContext,
  closestCenter
} from '@dnd-kit/core'

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'

import { CSS } from '@dnd-kit/utilities'

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
      r.onload = () => res({ url: r.result, id: crypto.randomUUID() })
      r.readAsDataURL(file)
    })

    const imgs = await Promise.all(files.map(read))

    setPhotos(prev => [...prev, ...imgs])
  }

  const handleDragEnd = (event) => {

    const { active, over } = event

    if (!over || active.id === over.id) return

    setPhotos((items) => {

      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)

      return arrayMove(items, oldIndex, newIndex)
    })
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

  const downloadAll = async () => {

    const pagesEl = document.querySelectorAll('.page')

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

        {/* CONTROL */}
        <div className="bg-white p-6 rounded-3xl space-y-4">

          <h1 className="font-bold text-xl">Auto Report</h1>

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

          <button
            onClick={exportCurrentPage}
            className="w-full py-2 bg-black text-white rounded-xl"
          >
            Export Page
          </button>

          <button
            onClick={downloadAll}
            className="w-full py-2 bg-green-600 text-white rounded-xl"
          >
            Download Semua
          </button>

        </div>

        {/* PREVIEW */}
        <div className="lg:col-span-2">

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >

            <div
              ref={previewRef}
              className="page bg-white p-6 rounded-xl shadow mx-auto"
              style={{ width: 850 }}
            >

              <div className={`grid ${cols} gap-3`}>

                <SortableContext items={photos.map(p => p.id)}>

                  {photos.map((img, i) => (
                    <SortableItem key={img.id} id={img.id} img={img} />
                  ))}

                </SortableContext>

              </div>

            </div>

          </DndContext>

        </div>

      </div>
    </div>
  )
}

// 🔥 DRAG ITEM
function SortableItem({ id, img }) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="aspect-[3/4] bg-gray-200 rounded overflow-hidden cursor-grab"
    >
      <img src={img.url} className="w-full h-full object-cover" />
    </div>
  )
}