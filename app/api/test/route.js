export async function GET() {
  const testArray = [1, 2, 3, { name: 'test', nested: { value: 42 } }, 'string'];

  console.log('Test array:', testArray);

  return Response.json({ message: 'Test endpoint', data: testArray });
}