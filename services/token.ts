export const fetchCourse = async (): Promise<{ course: number }> => {
  try {
    const response = await fetch('/api/get_course');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching course value:', error);
    throw error;
  }
};

export const performExchange = async (amount: number): Promise<{ success: boolean, amount: number }> => {
  try {
    const response = await fetch('/api/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error performing exchange:', error);
    throw error;
  }
}; 