export type KoaBodyOptions = {
  // Patch request body to Node's ctx.req, default false
  patchNode?: boolean;
  // Patch request body to Koa's ctx.request, default true
  patchKoa?: boolean;
  // The byte (if integer) limit of the JSON body, default 1mb
  jsonLimit?: string | number;
  // The byte (if integer) limit of the form body, default 56kb
  formLimit?: string | number;
  // The byte (if integer) limit of the text body, default 56kb
  textLimit?: string | number;
  // Sets encoding for incoming form fields, default utf-8
  encoding?: string;
  // Parse multipart bodies, default false
  multipart?: boolean;
  // Parse urlencoded bodies, default true
  urlencoded?: boolean;
  // Parse text bodies, such as XML, default true
  text?: boolean;
  // Parse JSON bodies, default true
  json?: boolean;
  // Toggles co-body strict mode; if set to true - only parses arrays or objects, default true
  jsonStrict?: boolean;
  // Toggles co-body returnRawBody option; if set to true, for form encodedand and JSON requests the raw, unparsed requesty body will be attached to ctx.request.body using a Symbol, default false
  includeUnparsed?: boolean;

  // See formidable for options
  formidable?: {
    // Limits the number of fields that the querystring parser will decode, default 1000
    maxFields?: number;
    // Limits the amount of memory all fields together (except files) can allocate in bytes. If this value is exceeded, an 'error' event is emitted, default 2mb (2 * 1024 * 1024)
    maxFieldsSize?: number;
    // Sets the directory for placing file uploads in, default os.tmpDir()
    uploadDir?: string;
    // Files written to uploadDir will include the extensions of the original files, default false
    keepExtensions?: boolean;
    // If you want checksums calculated for incoming files, set this to either 'sha1' or 'md5', default false
    hash?: string;
    // Multiple file uploads or no, default true
    multiples?: boolean;
    // Special callback on file begin. The function is executed directly by formidable. It can be used to rename files before saving them to disk. See the docs
    onFileBegin?: (name: string, file: any) => void;
  };
  // Custom error handle, if throw an error, you can customize the response - onError(error, context), default will throw
  onError?: (error, context) => any;
  // DEPRECATED If enabled, don't parse GET, HEAD, DELETE requests, default true
  strict?: boolean;
  // Declares the HTTP methods where bodies will be parsed, default ['POST', 'PUT', 'PATCH']. Replaces strict option.
  parsedMethods?: string[];
}