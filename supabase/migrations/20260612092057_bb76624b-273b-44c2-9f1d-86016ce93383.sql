
ALTER TABLE public.groups ALTER COLUMN created_by SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
CREATE POLICY "Authenticated users can create groups"
ON public.groups FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());
