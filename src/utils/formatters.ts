
export const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

export const FULL_THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

/**
 * Parses a Thai date string (e.g., "12 ม.ค. 2566" or "12 มกราคม 2566") into an ISO date string (YYYY-MM-DD).
 * Returns null if parsing fails.
 */
export function parseThaiDate(dateStr: string): string | null {
  if (!dateStr) return null;
  dateStr = dateStr.trim();
  
  // Try matching "D M.M. YYYY" or "D MMM YYYY"
  const parts = dateStr.split(" ");
  if (parts.length < 3) return null;

  const day = parseInt(parts[0]);
  const monthStr = parts[1];
  const yearStr = parts[2];
  
  let monthIndex = THAI_MONTHS.indexOf(monthStr);
  if (monthIndex === -1) {
    monthIndex = FULL_THAI_MONTHS.indexOf(monthStr);
  }
  
  if (monthIndex === -1 || isNaN(day)) return null;

  // Convert Buddhist Year to AD
  let year = parseInt(yearStr);
  if (year > 2400) year -= 543;

  const month = (monthIndex + 1).toString().padStart(2, '0');
  const dayString = day.toString().padStart(2, '0');
  
  return `${year}-${month}-${dayString}`;
}

/**
 * Parses a full Thai name string into components (Title, First, Last).
 * Handles common prefixes like "นาย", "น.ส.", "นาง", "Mr.", "Miss".
 */
export function parseThaiName(fullName: string): { title: string, firstName: string, lastName: string } {
  if (!fullName) return { title: "", firstName: "", lastName: "" };
  let remainingName = fullName.trim();
  
  // Common Thai prefixes
  const prefixes = ["นาย", "น.ส.", "นางสาว", "นาง", "ดร.", "ผศ.", "รศ.", "ศ."];
  let title = "";

  for (const prefix of prefixes) {
    if (remainingName.startsWith(prefix)) {
      title = prefix;
      remainingName = remainingName.substring(prefix.length).trim();
      break;
    }
  }

  // If no standard prefix found, try to split by space if the first part looks like a title
  if (!title) {
    const parts = remainingName.split(" ");
    if (parts.length > 2 && (parts[0].includes(".") || parts[0].length < 4)) {
       title = parts[0];
       remainingName = parts.slice(1).join(" ");
    }
  }

  const nameParts = remainingName.split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  return { title, firstName, lastName };
}
