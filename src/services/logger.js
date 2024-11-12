const { createLogger, format, transports } = require("winston");

const { combine, timestamp, printf, colorize } = format;
require("winston-daily-rotate-file");

// 로그 출력 형식 설정
const logFormat = printf(
  // eslint-disable-next-line no-shadow
  ({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (stack) {
      msg += `\nStack Trace: ${stack}`; // 에러 스택 출력
    }
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`; // 메타데이터 출력
    }
    return msg;
  }
);

// Daily Rotate File Transport 설정
const dailyRotateFileTransport = new transports.DailyRotateFile({
  dirname: "logs", // 로그 파일이 저장될 폴더
  filename: "%DATE%.log", // 날짜별로 로그 파일 생성
  datePattern: "YYYY-MM-DD", // 날짜 형식
  zippedArchive: true, // 압축 여부
  maxSize: "20m", // 파일 크기 제한
  maxFiles: "14d" // 보관 기간 (14일)
});

// Winston Logger 생성
const logger = createLogger({
  level: "info", // 기본 로그 레벨
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }), // 에러 스택 포함
    logFormat
  ),
  transports: [
    dailyRotateFileTransport, // 파일에 로그 저장
    new transports.Console({
      // 콘솔에도 로그 출력
      format: combine(
        colorize(), // 로그 레벨 컬러 적용
        logFormat
      )
    })
  ]
});

// 모듈로 export
module.exports = logger;
