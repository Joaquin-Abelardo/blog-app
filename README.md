## Database Setup
1. Create a Supabase project
2. Run tables.sql in SQL Editor
3. Create storage buckets:
   - blog-images **Public bucket turned on** 
   - comment-images **Public bucket turned on**
4. Add env variables

Create a `.env` file in the root directory with the following:

REACT_APP_SUPABASE_URL=your_supabase_url

REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key


## BLOGS TABLE POLICIES
//Allow everyone to read blogs

CREATE POLICY "Public can read blogs"
ON public.blogs
FOR SELECT
USING (true);

//Allow logged-in users to create blogs

CREATE POLICY "Users can insert blogs"
ON public.blogs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

//Allow users to update their own blogs

CREATE POLICY "Users can update their own blogs"
ON public.blogs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

//Allow users to delete their own blogs

CREATE POLICY "Users can delete their own blogs"
ON public.blogs
FOR DELETE
USING (auth.uid() = user_id);


## COMMENTS TABLE POLICIES
//Allow everyone to read comments

CREATE POLICY "Public can read comments"
ON public.comments
FOR SELECT
USING (true);

//Allow logged-in users to create comments

CREATE POLICY "Users can insert comments"
ON public.comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);




# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
