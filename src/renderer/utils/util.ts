export const convertToHoursAndMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export function unixToDate(unixTime: number) {
  const date = new Date(Number(unixTime) * 1000);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function unixToYYYYMMDD(unixTimestamp) {
  // Create a new Date object from the Unix timestamp
  // Unix timestamp is in seconds, so multiply by 1000 to get milliseconds
  const date = new Date(unixTimestamp * 1000);
  
  // Get the year, month and day
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() is zero-based
  const day = date.getDate();
  
  // Add leading zeros if needed
  const formattedMonth = month < 10 ? '0' + month : month;
  const formattedDay = day < 10 ? '0' + day : day;
  console.log(`${year}/${formattedMonth}/${formattedDay}`);
  
  // Return the formatted date string
  return `${year}-${formattedMonth}-${formattedDay}`;
}
