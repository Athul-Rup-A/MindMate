const isToday = (date) => {
  const today = new Date();
  const entryDate = new Date(date);
  return (
    today.getFullYear() === entryDate.getFullYear() &&
    today.getMonth() === entryDate.getMonth() &&
    today.getDate() === entryDate.getDate()
  );
};

export default isToday;