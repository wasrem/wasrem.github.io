import React, { useState } from "react"
import axios from "axios"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import BidList from "../G2bBidList"
import { PRESET_CODES, regionOptions } from "constants/mapping"

const api_key = process.env.REACT_APP_BidPublicInfoService_API_KEY_DEC
const baseUrlForBidList_nuri_g2b = "https://apis.data.go.kr/1230000/ao/PrvtBidNtceService/getPrvtBidPblancListInfoCnstwkPPSSrch"

const formatDate = (date, end = false) => {
  if (!date) return ""
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}${m}${d}${end ? "2359" : "0000"}`
}

// NuriBidSearch
const NuriBidSearch = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 0, 0)
  end.setDate(end.getDate() + 30)

  const [bidNtceNm, setBidNtceNm] = useState("")
  const [excludeKeyword, setExcludeKeyword] = useState("")
  const [regionCode, setRegionCode] = useState("")
  const [indstrytyCd, setIndstrytyCd] = useState("")
  const [activeCode, setActiveCode] = useState(null)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(end)
  const [data, setData] = useState([])

  const [loading, setLoading] = useState(false)
  const [filtering, setFiltering] = useState(false)
  const [error, setError] = useState(null)
  const [currentData, setCurrentData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(null)
  const rowsPerPage = 20

  const [sysMessage, setSysMessage] = useState("")
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)

  const checkDataCount = async (code = null) => {
    const finalCode = code || indstrytyCd
    if (!startDate || !endDate) {
      alert("조회 시작일과 종료일을 선택해주세요.")
      return null
    }

    setLoading(true)
    setError(null)
    setData([])

    const queryParams = {
      inqryDiv: "2",
      pageNo: "1",
      numOfRows: "1",
      inqryBgnDt: formatDate(startDate),
      inqryEndDt: formatDate(endDate, true),
      bidNtceNm,
      ServiceKey: api_key,
      indstrytyCd: finalCode,
      prtcptLmtRgnCd: regionCode,
      type: "json",
    }

    try {
      const response = await axios.get(baseUrlForBidList_nuri_g2b, { params: queryParams })
      const count = response.data.response.body.totalCount

      // 총 검색결과 체크
      setTotalCount(count)
      if (count > 999) {
        setSysMessage("999개까지 검색합니다.(검색결과의 수가 1000개 이상입니다. 검색 조건을 조정해주세요)")
        return 999
      }
      return count
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async (code = null, page = 1) => {
    const finalCode = code || indstrytyCd

    // filtering 작업 base
    const count = await checkDataCount(code)

    /*
      count의 최대값은 999임
      > 일단 1000 이상은 검색 안되게 해놨고
      검색조건 조정 안내 해뒀음
    */

    if (!count) return

    setLoading(true)
    setFiltering(true)
    setError(null)
    setData([])

    const queryParamsForBidList = {
      inqryDiv: "2",
      pageNo: "1",
      numOfRows: count,
      inqryBgnDt: formatDate(startDate),
      inqryEndDt: formatDate(endDate, true),
      bidNtceNm,
      ServiceKey: api_key,
      indstrytyCd: finalCode,
      prtcptLmtRgnCd: regionCode,
      type: "json",
    }

    try {
      const responseForBidList = await axios.get(baseUrlForBidList_nuri_g2b, { params: queryParamsForBidList })
      const rawItems = responseForBidList.data.response.body.items || []

      // 지역 체크 api 보내기 전에 이름이랑 공고종류에 대해서 필터링
      const filtered = rawItems.filter((item) => item.ntceKindNm !== "취소공고" && item.ntceKindNm !== "연기공고" && (!excludeKeyword || !item.bidNtceNm?.includes(excludeKeyword)))

      let itemsWithRegion

      // 지역코드가 있는 경우 API 요청 없이 처리
      itemsWithRegion = filtered.map((item, idx) => ({
        ...item,
        listOrder: (page - 1) * rowsPerPage + idx + 1,
        prtcptPsblRgnNm: getRegionNameByCode(regionCode) || "공고서참조",
      }))

      const validItems = itemsWithRegion.filter((item) => item !== null)

      const items = validItems.map((item, idx) => ({
        ...item,
        listOrder: (page - 1) * rowsPerPage + idx + 1,
      }))

      const startIdx = 0
      const endIdx = startIdx + rowsPerPage

      setData(items)
      setCurrentData(items.slice(startIdx, endIdx))
      setTotalCount(items.length)

      console.log(items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setFiltering(false)
    }
  }

  // 지역코드로 지역명 찾기
  const getRegionNameByCode = (code) => {
    const matchedRegion = regionOptions.find((region) => region.code === code)
    return matchedRegion ? matchedRegion.name : null
  }

  const handleCodeClick = (code) => {
    if (indstrytyCd === code) {
      setIndstrytyCd("")
      setActiveCode(null)
    } else {
      setIndstrytyCd(code)
      setActiveCode(code)
    }
  }

  const handlePageChange = (newPage) => {
    const startIdx = (newPage - 1) * rowsPerPage
    const endIdx = startIdx + rowsPerPage

    if (!data || data.length === 0 || startIdx >= data.length) {
      setCurrentData([])
    } else {
      const pageData = data.slice(startIdx, endIdx)
      setCurrentData(pageData)
    }

    setCurrentPage(newPage)
  }

  const resetForm = () => {
    setBidNtceNm("")
    setExcludeKeyword("")
    setRegionCode("")
    setIndstrytyCd("")
    setActiveCode(null)
    setStartDate(today)
    setEndDate(end)
    setData([])
    setError(null)
    setCurrentPage(1)
    setTotalCount(null)
  }

  const totalPages = Math.ceil(totalCount / rowsPerPage)

  /* 다운로드, 복사 */
  const formatDataToText = (data) => {
    return data
      .map((item) => {
        return `${item.ntceNm ?? "-"}\t${item.rgstTyNm ?? "-"}\t${item.bidClseDt ?? "-"}\t${item.sucsfbidLwltRate ?? "-"}\t${indstrytyCd ?? "-"}\t${
          item.prtcptPsblRgnNm ?? "-"
        }\t${((item.sucsfbidLwltRate ?? 0) / 100).toFixed(5)}\t${item.asignBdgtAmt ?? "-"}`
      })
      .join("\n")
  }

  const handleDownload = (data) => {
    const formattedText = formatDataToText(data)

    const blob = new Blob([formattedText], { type: "text/plain;charset=utf-8" })

    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "BitList.txt"
    a.click()

    window.URL.revokeObjectURL(url)
  }

  const handleCopy = (data) => {
    const formattedText = formatDataToText(data)

    navigator.clipboard
      .writeText(formattedText)
      .then(() => {
        alert("텍스트가 클립보드에 복사되었습니다. Crtl + V 로 붙여넣으세요.")
      })
      .catch((err) => {
        alert("클립보드에 복사 실패: " + err)
      })
  }

  const handleUrgentBid = () => {
    if (!showUrgentOnly) {
      const urgentData = data.filter((item) => {
        if (!item.bidClseDt) return false

        const now = new Date() // 현재 시간
        const deadline = new Date(item.bidClseDt) // 마감일

        const threeDaysLaterEnd = new Date(now)
        threeDaysLaterEnd.setDate(now.getDate() + 3)
        threeDaysLaterEnd.setHours(23, 59, 0, 0)

        return deadline >= now && deadline <= threeDaysLaterEnd
      })
      setCurrentData(urgentData)
    } else {
      setCurrentData(data.slice(0, 20))
      setCurrentPage(1)
    }
    setShowUrgentOnly((prev) => !prev)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h1 className="text-xl font-bold text-gray-800 mb-2">누리장터 입찰공고(용역) 검색</h1>
          <p className="text-sm text-gray-600">개찰일(마감일) 기준으로 검색합니다</p>
          <p className="text-sm text-gray-600">* 누리장터는 공고번호를 누리장터에 검색하셔서 공고서를 참조하셔야 합니다.</p>
        </div>

        {/* 검색 폼 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="space-y-4">
            {/* 검색어 입력 */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🔍 공고 제목에 포함될 단어</label>
                  <input
                    type="text"
                    value={bidNtceNm}
                    onChange={(e) => setBidNtceNm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setCurrentPage(1)
                        fetchData(null, 1)
                      }
                    }}
                    placeholder="예: 청소, 보안, 급식 등"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">❌ 제외할 단어</label>
                  <input
                    type="text"
                    value={excludeKeyword}
                    onChange={(e) => setExcludeKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setCurrentPage(1)
                        fetchData(null, 1)
                      }
                    }}
                    placeholder="예: 청소년, 학원 등"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 날짜 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 검색 기간</label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => {
                      const adjusted = new Date(date)
                      adjusted.setHours(0, 0, 0, 0)
                      setStartDate(adjusted)
                    }}
                    dateFormat="yyyy-MM-dd"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">~</span>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => {
                      const adjusted = new Date(date)
                      adjusted.setHours(23, 59, 0, 0)
                      setEndDate(adjusted)
                    }}
                    dateFormat="yyyy-MM-dd"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => {
                    const newStartDate = new Date(startDate)
                    newStartDate.setDate(newStartDate.getDate() - 31)
                    newStartDate.setHours(0, 0, 0, 0)

                    const newEndDate = startDate
                    newEndDate.setDate(startDate.getDate() - 1)
                    newEndDate.setHours(23, 59, 0, 0)

                    setStartDate(newStartDate)
                    setEndDate(newEndDate)
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap">
                  📆 1달 전 기간
                </button>
              </div>
            </div>

            {/* 업종코드와 지역코드 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🏢 업종코드 (선택사항)</label>
                <input
                  type="text"
                  value={indstrytyCd}
                  onChange={(e) => {
                    setIndstrytyCd(e.target.value)
                    setActiveCode(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setCurrentPage(1)
                      fetchData(null, 1)
                    }
                  }}
                  placeholder="예: 1172"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🌍 지역 선택 (선택사항 - 전국이 아닌 지역을 선택하면 전국은 안나옵니다.)</label>
                <select
                  value={regionCode}
                  onChange={(e) => {
                    setRegionCode(e.target.value)
                    setActiveCode(null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                  <option value="">전체 지역</option>
                  {regionOptions.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 업종코드 빠른 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">⚡ 자주 사용하는 업종코드</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_CODES.map((code) => (
                  <button
                    key={code}
                    onClick={() => handleCodeClick(code)}
                    className={`px-3 py-1 text-sm rounded-full border transition-all ${
                      activeCode === code || indstrytyCd === code
                        ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                    }`}>
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* 검색 버튼 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  fetchData(null, 1)
                }}
                className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}>
                {loading ? "🔄 검색중..." : "🔍 검색하기"}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all">
                ↺ 초기화
              </button>
            </div>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              <p className="text-red-700">오류: {error}</p>
            </div>
          </div>
        )}

        {/* 검색 결과 */}
        {totalCount && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">검색 결과</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-blue-600">{totalCount}</span>
                  <span className="text-gray-600">개의 공고를 찾았습니다</span>
                </div>
                {sysMessage && <p className="text-sm text-gray-500 mt-1">{sysMessage}</p>}
                {filtering && (
                  <div className="flex items-center text-orange-600 text-sm mt-1">
                    <span className="animate-spin mr-2">⏳</span>
                    맞춤 정보 필터링 중...
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handleUrgentBid}
                  className={`px-4 py-2 font-medium rounded-lg transition-all ${
                    showUrgentOnly ? "bg-red-500 text-white hover:bg-red-600" : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  }`}>
                  {showUrgentOnly ? "📋 전체 보기" : "⚡ 마감임박 (3일 이내)"}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleCopy(data)}
                className="flex-1 sm:flex-none px-4 py-2 bg-green-50 text-green-700 border border-green-200 font-medium rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all">
                📋 목록 복사
              </button>
              <button
                onClick={() => handleDownload(data)}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 font-medium rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all">
                💾 다운로드
              </button>
            </div>
          </div>
        )}

        {/* 결과 리스트 */}
        {data.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <BidList items={currentData} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} showUrgentOnly={showUrgentOnly} />
          </div>
        )}
      </div>
    </div>
  )
}

export default NuriBidSearch
