import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import eventsService from '../../../services/eventsService';
import eventTypes from '../../../data/eventTypes';
import '../styles/EventReservationFormModal.css';

const EventReservationFormModal = ({ show, handleClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: '',
    location: '',
    capacity: '',
    description: '',
    date: '',
    photos: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        type: initialData.type || '',
        location: initialData.location || '',
        capacity: initialData.capacity || '',
        description: initialData.description || '',
        date: initialData.date || '',
        photos: initialData.photos || []
      });
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      type: '',
      location: '',
      capacity: '',
      description: '',
      date: '',
      photos: []
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photos') {
      const fileArray = Array.from(files);
      const fileReaders = fileArray.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      Promise.all(fileReaders).then((fileDataUrls) => {
        setFormData({ ...formData, photos: [...formData.photos, ...fileDataUrls] });
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (selectedOption, name) => {
    setFormData({ ...formData, [name]: selectedOption.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.location) {
      alert('Please select a location.');
      return;
    }

    try {
      const eventStartDate = new Date(formData.date);
      const eventEndDate = new Date(formData.date);
      eventEndDate.setHours(eventEndDate.getHours() + 2); // Assuming events last for 2 hours

      const newEvent = {
        ...formData,
        start: eventStartDate,
        end: eventEndDate
      };

      // Check if it's an edit or new event
      if (formData.id) {
        eventsService.editEvent(newEvent);
      } else {
        eventsService.addEvent(newEvent);
      }

      onSave(newEvent);
      handleClose();
      resetForm();
    } catch (error) {
      // handle error
    }
  };

  return (
    <Modal show={show} onHide={() => { handleClose(); resetForm(); }} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{formData.id ? 'Edit Event' : 'Create New Sports Event'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formType">
            <Form.Label>Type</Form.Label>
            <Select
              value={eventTypes.find(option => option.value === formData.type)}
              onChange={(option) => handleSelectChange(option, 'type')}
              options={eventTypes}
              placeholder="Select event type"
              required
            />
          </Form.Group>

          <Form.Group controlId="formLocation">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formCapacity">
            <Form.Label>Capacity</Form.Label>
            <Form.Control
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formDate">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formPhotos">
            <Form.Label>Photos</Form.Label>
            <div className="existing-photos">
              {formData.photos && formData.photos.length > 0 && (
                <div className="photo-grid">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={photo} alt={`Event ${index}`} className="photo-thumbnail" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Form.Control
              type="file"
              name="photos"
              onChange={handleChange}
              multiple
              accept="image/*"
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            {formData.id ? 'Edit Event' : 'Create New Sports Event'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EventReservationFormModal;