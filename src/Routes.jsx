import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import  App  from './control';
import  EditPage  from './editPage';

const Routers = () => {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<EditPage></EditPage>} />
                <Route exact path="/control" element={<App></App>} />

            </Routes>
        </Router>
    )
}

export default Routers;