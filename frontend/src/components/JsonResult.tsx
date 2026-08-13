import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JsonResultProps {
  data: unknown;
  title?: string;
}

function JsonResult({ data, title = 'Resultado' }: JsonResultProps) {
  if (data === null) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-sm overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
      </CardContent>
    </Card>
  );
}

export default JsonResult;
