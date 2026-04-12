# Lua generation patterns

- For arrays in the platform, prefer iterating with `ipairs` and constructing new arrays with `_utils.array.new()`.
- For filtering arrays, return the new filtered array and `nil` if the result is empty.
- For cleaning fields inside an existing array of objects, mutate the object fields to `nil` and return the transformed array.
- For ISO 8601 from DATUM and TIME, preserve the original field names and prefer `string.format`.
- For unix timestamp conversion from ISO 8601, parse components with `string.match` and compute days-to-seconds manually with `86400`.
- Before using `#value`, first check that `value` is not `nil`.
- For patterns like `wf.vars.ws`, prefer: check `wf.vars.ws == nil`, then check `#wf.vars.ws == 0`, then return `wf.vars.ws`.
