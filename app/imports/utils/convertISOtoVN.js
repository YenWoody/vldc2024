function toVNISOStringNoOffset(input) {
  let utcDate;
  if (input != undefined && input != " Time ") {
    try {
      if (typeof input === "string") {
        // Nếu có timezone thì parse thẳng
        if (/Z$|[+-]\d\d:?\d\d$/.test(input)) {
          utcDate = new Date(input);
        } else {
          // Không có timezone thì parse thủ công
          const [datePart, timePart = "00:00:00"] = input.split("T");
          const [Y, M, D] = datePart.split(/[-/]/).map(Number);
          const [h = 0, m = 0, s = 0] = timePart.split(":").map(Number);
          const [sec = 0, ms = 0] = String(s).split(".");
          utcDate = new Date(
            Date.UTC(Y, M - 1, D, h, m, Number(sec), Number(ms))
          );
        }
      } else if (input instanceof Date) {
        utcDate = new Date(input);
      } else {
        throw new Error("Invalid input");
      }

      // Cộng thêm 7h
      const vn = new Date(utcDate.getTime() + 7 * 3600 * 1000);

      // Format ISO (không offset, giữ 3 chữ số ms)
      return vn.toISOString().replace("Z", "").slice(0, -1);
    } catch (e) {
      console.error(e);
    }
  }
}
export default toVNISOStringNoOffset;
