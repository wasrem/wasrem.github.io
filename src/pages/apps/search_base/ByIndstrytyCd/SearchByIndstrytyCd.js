// SearchByIndstrytyCd.jsx
import React, { useState } from "react"
import axios from "axios"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import BidList from "./BidList"

const api_key = process.env.REACT_APP_BidPublicInfoService_API_KEY_DEC
const PRESET_CODES = ["1162", "1164", "1172", "1173", "1192", "1260"]
const baseUrlForBidList = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServcPPSSrch"
const baseUrlForPrtcptPsblRgnNmOfBid = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoPrtcptPsblRgn"

const formatDate = (date, end = false) => {
  if (!date) return ""
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}${m}${d}${end ? "2359" : "0000"}`
}

const SearchByIndstrytyCd = () => {
  const today = new Date()
  today.setHours(23, 59, 0, 0)

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 31)

  const [bidNtceNm, setBidNtceNm] = useState("")
  const [excludeKeyword, setExcludeKeyword] = useState("")
  const [regionCode, setRegionCode] = useState("")
  const [indstrytyCd, setIndstrytyCd] = useState("")
  const [activeCode, setActiveCode] = useState(null)
  const [startDate, setStartDate] = useState(start)
  const [endDate, setEndDate] = useState(today)
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
      const response = await axios.get(baseUrlForBidList, { params: queryParams })
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
      const responseForBidList = await axios.get(baseUrlForBidList, { params: queryParamsForBidList })

      const rawItems = responseForBidList.data.response.body.items || []

      // 지역 체크 api 보내기 전에 이름이랑 공고종류에 대해서 필터링
      const filtered = rawItems.filter((item) => item.ntceKindNm !== "취소공고" && item.ntceKindNm !== "연기공고" && (!excludeKeyword || !item.bidNtceNm?.includes(excludeKeyword)))

      const itemsWithRegion = await Promise.all(
        filtered.map(async (item, idx) => {
          // bidNtceNo와 bidNtceOrd를 쿼리 파라미터로 설정 (inqryDiv: 2면 필수값임)
          const queryParamsForRegion = {
            inqryDiv: "2",
            pageNo: "1",
            numOfRows: "1",
            ServiceKey: api_key,
            bidNtceNo: item.bidNtceNo,
            bidNtceOrd: item.bidNtceOrd,
            type: "json",
          }

          try {
            const responseForRegion = await axios.get(baseUrlForPrtcptPsblRgnNmOfBid, { params: queryParamsForRegion })
            const resultCode = responseForRegion.data.response.header.resultCode
            const apiItems = responseForRegion.data.response.body.items

            // 결과가 정상이고 totalCount가 0일 경우 "전국"으로 설정
            let prtcptPsblRgnNm = "전국(공고서에 따라 다름)" // 기본값은 전국으로 설정

            // 만약 totalCount가 1 이상이면 참가가능지역을 받아온 값으로 설정 > 일단 서울이랑 전국으로 필터링
            if (resultCode === "00" && apiItems !== undefined) {
              prtcptPsblRgnNm = apiItems[0].prtcptPsblRgnNm || "전국(공고서에 따라 다름)" // 값을 받아오지 못했을 경우 기본값은 "전국"
            }

            // 참가가능지역 필터링: 서울, 서울특별시, 전국이 아닌 경우 목록에서 제외
            if (!["서울", "서울특별시", "전국(공고서에 따라 다름)"].includes(prtcptPsblRgnNm)) {
              return null
            }

            // 기존 데이터에 참가가능지역 추가
            return {
              ...item,
              listOrder: (page - 1) * rowsPerPage + idx + 1,
              prtcptPsblRgnNm,
            }
          } catch (error) {
            console.error("API 요청 실패:", error)
            return {
              ...item,
              listOrder: (page - 1) * rowsPerPage + idx + 1,
              prtcptPsblRgnNm: "API 요청 실패",
            }
          }
        })
      )

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
      console.log(currentData)

      /* 
        TODO: 
            
            - 필터링 후 리스트업 
            - 지원 자격 체크 
            - UI/UX 고민

        DONE: 
            - 공고종류(상태) 검색조건 추가 : 일단 취소공고랑 연기공고 자동 필터링
            - 제외 키워드 검색조건 추가 
            - 지역 검색조건 최적화 : 일단 데이터 개선 요청 넣어놨음 
              > 입찰 공고 목록 정보에 대한 참가 가능 지역 조회(getBidPblancListInfoPrtcptPsblRgn)에 
                조회구분 2로 bidNtceNo랑 bidNtceOrd를 보내면 참가 가능 지역을 가져올 수 있음
                resultCode == 00 이면서 totalCount가 0이면 참가가능지역제한이 없다는 거임 or 공고서 참조
                현재는 api를 n개의 데이터에 대해 n번 보냄 ...
            - 배포 방법 고민
              > 일단 gh-pages로 배포
            - 필터링이랑 페이징, 지역 제한 체크, totalCount 등은 임시로 해결 
      */
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setFiltering(false)
    }
  }

  const handleCodeClick = (code) => {
    setIndstrytyCd(code)
    setActiveCode(code)
    setCurrentPage(1)
    fetchData(code, 1)
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
    setStartDate(start)
    setEndDate(today)
    setData([])
    setError(null)
    setCurrentPage(1)
    setTotalCount(null)
  }

  const totalPages = Math.ceil(totalCount / rowsPerPage)

  /* 다운로드 */
  const formatDataToText = (data) => {
    return data
      .map((item) => {
        return `${item.bidNtceNm ?? "-"}\t${item.rgstTyNm ?? "-"}\t${item.bidClseDt ?? "-"}\t${item.sucsfbidLwltRate ?? "-"}\t${indstrytyCd ?? "-"}\t${
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
    a.download = "list.txt" // 파일 이름
    a.click()

    window.URL.revokeObjectURL(url)
  }

  const handleCopy = (data) => {
    const formattedText = formatDataToText(data)

    navigator.clipboard
      .writeText(formattedText)
      .then(() => {
        alert("텍스트가 클립보드에 복사되었습니다.")
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl font-bold mb-6">Search by indstrytyCd</h1>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div>
          <label className="block text-sm font-medium mb-1">공고 제목 포함</label>
          <input type="text" value={bidNtceNm} onChange={(e) => setBidNtceNm(e.target.value)} placeholder="예: 청소" className="border p-2 rounded w-48" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">제외 키워드</label>
          <input type="text" value={excludeKeyword} onChange={(e) => setExcludeKeyword(e.target.value)} placeholder="예: 청소년" className="border p-2 rounded w-48" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">지역제한코드</label>
          <input disabled type="text" value={regionCode} onChange={(e) => setRegionCode(e.target.value)} placeholder="아직 사용 불가" className="border p-2 rounded w-48" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">시작일</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              const adjusted = new Date(date)
              adjusted.setHours(0, 0, 0, 0)
              setStartDate(adjusted)
            }}
            dateFormat="yyyy-MM-dd"
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">종료일</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              const adjusted = new Date(date)
              adjusted.setHours(23, 59, 0, 0)
              setEndDate(adjusted)
            }}
            dateFormat="yyyy-MM-dd"
            className="border p-2 rounded"
          />
        </div>
        <div>
          <div>
            <div className="flex gap-2 mt-6 items-end">
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
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                1달 전으로
              </button>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">업종코드</label>
            <input
              type="text"
              value={indstrytyCd}
              onChange={(e) => {
                setIndstrytyCd(e.target.value)
                setActiveCode(null)
              }}
              placeholder="예: 1172"
              className="border p-2 rounded w-48"
            />
          </div>
          <div className="flex gap-2 mt-6 items-end">
            <button
              onClick={() => {
                setCurrentPage(1)
                fetchData(null, 1)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}>
              검색
            </button>
            <button onClick={resetForm} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
              초기화
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {PRESET_CODES.map((code) => (
          <button
            key={code}
            onClick={() => handleCodeClick(code)}
            className={`px-4 py-2 rounded border ${activeCode === code ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
            {code}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {totalCount && (
        <div className="mb-5">
          {/* 첫 줄: 총 개수 + 필터링 + 복사/다운로드 버튼 */}
          <div className="flex justify-between items-center mb-2">
            <p className="text-black-500">
              총 {totalCount}개 검색됨 : {[sysMessage]}
            </p>
            {filtering && <div className="text-black-500"> - 내게 맞는 정보들만 필터링 중 ... </div>}
            <div className="ml-auto flex space-x-4">
              <button
                onClick={() => handleCopy(data)}
                className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all">
                전체 목록 복사
              </button>
              <button
                onClick={() => handleDownload(data)}
                className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all">
                전체 목록 다운로드
              </button>
            </div>
          </div>

          {/* 두 번째 줄: 오른쪽 정렬된 "마감 3일 이내" 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleUrgentBid}
              className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all">
              {showUrgentOnly ? "전체 공고 보기" : "마감이 3일 이내인 공고 보기"}
            </button>
          </div>
        </div>
      )}

      {data.length > 0 && <BidList items={currentData} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} showUrgentOnly={showUrgentOnly} />}
    </div>
  )
}

export default SearchByIndstrytyCd
