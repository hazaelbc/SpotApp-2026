import * as AWS from 'aws-sdk'; // Asegúrate de usar esta sintaxis para importar

// Configuración del SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Instancia del cliente S3
const s3 = new AWS.S3();

// Función para generar una URL prefirmada
export const getPresignedUrl = (filename: string, contentType: string): Promise<string> => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `uploads/${Date.now()}_${filename}`,
    Expires: 60, // URL válida por 60 segundos
    ContentType: contentType,
  };

  return s3.getSignedUrlPromise('putObject', params);
};

// Función para probar la conexión con el bucket
export const testS3Connection = async (): Promise<void> => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    console.log('Conexión exitosa. Objetos en el bucket:', data.Contents);
  } catch (error) {
    console.error('Error al conectar con el bucket de S3:', error);
  }
};