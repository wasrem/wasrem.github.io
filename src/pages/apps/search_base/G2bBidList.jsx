// BidList.jsx
import React, { useState } from "react"
import Modal from "react-modal"

Modal.setAppElement("#root")

const formatDate = (datetime) => datetime?.split(" ")[0]

const BidList = ({ items, currentPage, totalPages, onPageChange }) => {
  const [selected, setSelected] = useState(null)
  const pagesPerGroup = 10

  const totalPageGroups = Math.ceil(totalPages / pagesPerGroup)
  const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup)
  const pageNumbers = Array.from({ length: Math.min(pagesPerGroup, totalPages - currentGroup * pagesPerGroup) }, (_, i) => currentGroup * pagesPerGroup + i + 1)

  const goToPage = (page) => {
    onPageChange(page)
  }

  const goToPrevGroup = () => {
    if (currentGroup > 0) {
      const prevGroupStart = (currentGroup - 1) * pagesPerGroup + 1
      onPageChange(prevGroupStart)
    }
  }

  const goToNextGroup = () => {
    if (currentGroup < totalPageGroups - 1) {
      const nextGroupStart = (currentGroup + 1) * pagesPerGroup + 1
      onPageChange(nextGroupStart)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={`${item.bidNtceNo}-${item.listOrder}`} className="border rounded-lg p-4 shadow hover:bg-gray-50 transition">
            <h2 className="text-blue-600 font-bold text-lg cursor-pointer hover:underline" onClick={() => setSelected(item)}>
              #{item.listOrder}. {item.bidNtceNm || item.ntceNm}
            </h2>
            <p>
              <span className="font-semibold text-gray-700">기관:</span> {item.ntceInsttNm}
            </p>
            <p>
              <span className="font-semibold text-gray-700">참가 가능 지역:</span> {item.prtcptPsblRgnNm}
            </p>
            <p>
              <span className="font-semibold text-gray-700">공고번호:</span> {item.bidNtceNo}
            </p>
            <p>
              <span className="font-semibold text-gray-700">공고일:</span> {formatDate(item.bidNtceDt)}
            </p>
            <p>
              <span className="text-green-700">입찰:</span> {formatDate(item.bidBeginDt)} ~ {formatDate(item.bidClseDt)}
            </p>
            <p>
              <span className="text-purple-700">개찰:</span> {formatDate(item.opengDt)}
            </p>
            <p>
              <span className="text-red-500">기초금액:</span> {item.asignBdgtAmt ? parseInt(item.asignBdgtAmt).toLocaleString() : "-"}원
            </p>
            <p>
              <span className="text-red-700">추정가격:</span> {item.presmptPrce ? parseInt(item.presmptPrce).toLocaleString() : "-"}원
            </p>
            {item.bidNtceDtlUrl && (
              <a href={item.bidNtceDtlUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline mt-2 inline-block">
                나라장터 상세보기
              </a>
            )}
          </div>
        ))}
      </div>

      {/* 페이징 */}
      <div className="flex justify-center mt-6 gap-1 flex-wrap">
        <button onClick={goToPrevGroup} disabled={currentGroup === 0} className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200">
          ◀
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-3 py-1 border rounded ${page === currentPage ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
            {page}
          </button>
        ))}
        <button onClick={goToNextGroup} disabled={currentGroup === totalPageGroups - 1} className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200">
          ▶
        </button>
      </div>

      {/* 상세 모달 */}
      {selected && (
        <Modal
          isOpen={true}
          onRequestClose={() => setSelected(null)}
          className="bg-white p-6 rounded shadow-xl max-w-xl mx-auto mt-10 outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
          <h2 className="text-xl font-bold mb-4">{selected.bidNtceNm}</h2>
          <p>
            <strong>기관:</strong> {selected.ntceInsttNm}
          </p>
          <p>
            <strong>발주처:</strong> {selected.rgstTyNm}
          </p>
          <p>
            <strong>계약방법:</strong> {selected.cntrctCnclsMthdNm}
          </p>
          <p>
            <strong>서비스분류:</strong> {selected.pubPrcrmntClsfcNm}
          </p>
          <p>
            <strong>담당자:</strong> {selected.ntceInsttOfclNm || selected.ofclNm} ({selected.ntceInsttOfclTelNo || selected.ofclTelNo})
          </p>
          <p>
            <strong>낙찰하한율:</strong> {selected.sucsfbidLwltRate || "-"}%
          </p>
          <p>
            <strong>기초금액:</strong> {selected.asignBdgtAmt ? parseInt(selected.asignBdgtAmt).toLocaleString() : "-"}원
          </p>
          <p>
            <strong>추정가격:</strong> {selected.presmptPrce ? parseInt(selected.presmptPrce).toLocaleString() : "-"}원
          </p>
          <p className="mt-2">
            <strong>첨부파일:</strong>
          </p>
          {[...Array(10).keys()].map((i) => {
            const file = selected[`ntceSpecDocUrl${i + 1}`]
            const name = selected[`ntceSpecFileNm${i + 1}`] || selected[`ntceSpecDocNm${i + 1}`]

            console.log(selected)

            return file ? (
              <a key={i} href={file} target="_blank" rel="noopener noreferrer" className="block text-blue-500 underline">
                📄 {name}
              </a>
            ) : null
          })}
          <div className="mt-4 flex justify-end">
            <button onClick={() => setSelected(null)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              닫기
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default BidList
